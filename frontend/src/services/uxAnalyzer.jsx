import { fetchSessionData } from './dataService';
import { analyzeBehaviorPatterns } from './BehaviorAnalysis';
import { generateContext } from './contextGenerator';
import axios from 'axios';

const CLAUDE_API_URL = 'https://api.claude.ai/v1/evaluate'; 
// eslint-disable-next-line no-undef
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY; 

const SUS_QUESTIONS = [
  "I think that I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I think that I would need the support of a technical person to be able to use this system.",
  "I found the various functions in this system were well integrated.",
  "I thought there was too much inconsistency in this system.",
  "I would imagine that most people would learn to use this system very quickly.",
  "I found the system very cumbersome to use.",
  "I felt very confident using the system.",
  "I needed to learn a lot of things before I could get going with this system."
];

const UEQ_QUESTIONS = [
  "Attractiveness: Overall impression of the product. Do users like or dislike it?",
  "Perspicuity: Is it easy to get familiar with the product? Is it easy to learn how to use the product?",
  "Efficiency: Can users solve their tasks without unnecessary effort?",
  "Dependability: Does the user feel in control of the interaction?",
  "Stimulation: Is it exciting and motivating to use the product?",
  "Novelty: Is the product innovative and creative? Does it catch the interest of users?"
];

const analyzeUserExperience = async (sessionId) => {
  try {
    const sessionData = await fetchSessionData(sessionId);
    if (!sessionData) {
      throw new Error('No session data found');
    }

    const behaviorPatterns = analyzeBehaviorPatterns(sessionData);

    const context = generateContext(behaviorPatterns, sessionData);

    return {
      sessionData,
      behaviorPatterns,
      context,
      metadata: {
        analyzedAt: new Date().toISOString(),
        sessionId,
        totalInteractions: behaviorPatterns.overallEngagement.totalInteractions,
        dominantEmotions: extractDominantEmotions(sessionData.emotions)
      }
    };
  } catch (error) {
    console.error('Error analyzing user experience:', error);
    throw error;
  }
};

const extractDominantEmotions = (emotions) => {
  if (!emotions || !emotions.emotionTimeline) return [];

  const emotionCounts = emotions.emotionTimeline.reduce((acc, emotion) => {
    const { emotion_type, avg_confidence } = emotion;
    if (!acc[emotion_type]) {
      acc[emotion_type] = {
        count: 0,
        totalConfidence: 0
      };
    }
    acc[emotion_type].count += 1;
    acc[emotion_type].totalConfidence += avg_confidence;
    return acc;
  }, {});

  return Object.entries(emotionCounts)
    .map(([emotion, data]) => ({
      emotion,
      count: data.count,
      averageConfidence: data.totalConfidence / data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); 
};

const formatContextForLLM = (context) => {
  return `
General Context:
${context.generalContext}

Detailed Analysis:
${context.specificInsights}

Recommendation Framework:
${context.recommendationContext}

SUS Questions and Responses:
${context.susResponses.map((response, index) => `${SUS_QUESTIONS[index]}: ${response}`).join('\n')}

UEQ Questions and Responses:
${context.ueqResponses.map((response, index) => `${UEQ_QUESTIONS[index]}: ${response}`).join('\n')}

Please evaluate this user experience data and provide:
1. Key usability issues and their severity
2. Positive aspects of the current design
3. Specific recommendations for improvement
4. Quantitative UX metrics interpretation
5. SUS score and interpretation
6. UEQ evaluation and interpretation
`;
};

const callClaudeAPI = async (context) => {
  try {
    const response = await axios.post(CLAUDE_API_URL, {
      context: context,
    }, {
      headers: {
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to call Claude API');
  }
};

const getUXEvaluation = async (sessionId) => {
  try {
    const analysis = await analyzeUserExperience(sessionId);
    
    const llmContext = formatContextForLLM(analysis.context);
    
    const evaluationResponse = await callClaudeAPI(llmContext);
    
    return {
      analysis,
      evaluation: evaluationResponse,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting UX evaluation:', error);
    throw new Error('Failed to get UX evaluation');
  }
};

class PersonalizedScoreCalculator {
    constructor() {
        this.baseWeights = {
            sus: {
                learnability: 0.2,    // 학습 용이성
                efficiency: 0.2,      // 효율성
                memorability: 0.2,    // 기억 용이성
                errors: 0.2,         // 오류
                satisfaction: 0.2     // 만족도
            },
            ueq: {
                attractiveness: 0.167,  // 매력도
                perspicuity: 0.167,    // 명확성
                efficiency: 0.167,     // 효율성
                dependability: 0.167,  // 신뢰성
                stimulation: 0.167,    // 자극성
                novelty: 0.167         // 참신성
            }
        };
    }

    calculatePersonalizedScore(behaviorData, userProfile) {
        const adjustedWeights = this.adjustWeightsByUserProfile(userProfile);
        const susScore = this.calculateSUSScore(behaviorData.susResponses, adjustedWeights.sus);
        const ueqScore = this.calculateUEQScore(behaviorData.ueqResponses, adjustedWeights.ueq);

        return {
            sus: susScore,
            ueq: ueqScore,
            appliedWeights: adjustedWeights
        };
    }

    adjustWeightsByUserProfile(userProfile) {
        const weights = {
            sus: { ...this.baseWeights.sus },
            ueq: { ...this.baseWeights.ueq }
        };

        this.adjustByAge(weights, userProfile.age);
                
        this.adjustByEducation(weights, userProfile.education);
        
        this.adjustByOccupation(weights, userProfile.occupation);
        
        this.adjustByUIPreference(weights, userProfile.uiPreference);
        
        this.adjustByInteractionPreference(weights, userProfile.interactionPreference);

        this.normalizeWeights(weights.sus);
        this.normalizeWeights(weights.ueq);

        return weights;
    }

    adjustByAge(weights, age) {
        if (age < 30) {
            weights.sus.efficiency *= 1.2;
            weights.ueq.novelty *= 1.2;
            weights.ueq.stimulation *= 1.1;
        } else if (age >= 30 && age < 50) {
            weights.sus.efficiency *= 1.15;
            weights.ueq.dependability *= 1.15;
        } else {
            weights.sus.learnability *= 1.3;
            weights.ueq.perspicuity *= 1.2;
            weights.sus.errors *= 1.2;
        }
    }

    adjustByEducation(weights, education) {
        switch(education) {
            case 'high_school':
                weights.sus.learnability *= 1.2;
                weights.ueq.perspicuity *= 1.2;
                break;
            case 'bachelors':
                weights.sus.efficiency *= 1.1;
                weights.ueq.efficiency *= 1.1;
                break;
            case 'masters_or_higher':
                weights.sus.efficiency *= 1.2;
                weights.ueq.novelty *= 1.1;
                break;
        }
    }

    adjustByOccupation(weights, occupation) {
        switch(occupation) {
            case 'office_worker':
                weights.sus.efficiency *= 1.3;
                weights.ueq.efficiency *= 1.2;
                break;
            case 'student':
                weights.sus.learnability *= 1.2;
                weights.ueq.novelty *= 1.2;
                break;
            case 'professional':
                weights.sus.efficiency *= 1.3;
                weights.ueq.dependability *= 1.2;
                break;
            case 'other':
                break;
        }
    }

    adjustByUIPreference(weights, preference) {
        switch(preference) {
            case 'minimal':
                weights.sus.efficiency *= 1.3;
                weights.ueq.perspicuity *= 1.2;
                weights.ueq.attractiveness *= 1.1;
                break;
            case 'detailed':
                weights.sus.learnability *= 1.2;
                weights.ueq.dependability *= 1.2;
                weights.ueq.perspicuity *= 1.1;
                break;
        }
    }

    adjustByInteractionPreference(weights, preference) {
        switch(preference) {
            case 'keyboard':
                weights.sus.efficiency *= 1.3;
                weights.ueq.efficiency *= 1.2;
                weights.sus.memorability *= 1.1;
                break;
            case 'click':
                weights.sus.learnability *= 1.2;
                weights.ueq.perspicuity *= 1.2;
                weights.ueq.attractiveness *= 1.1;
                break;
        }
    }

    normalizeWeights(weights) {
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        for (let key in weights) {
            weights[key] = weights[key] / sum;
        }
    }

    calculateSUSScore(susResponses, weights) {
        const totalScore = susResponses.reduce((sum, response, index) => {
            const weight = Object.values(weights)[index % 5]; 
            return sum + (response - 1) * weight;
        }, 0);
        const susScore = (totalScore * 2.5) / susResponses.length; 
        return susScore;
    }

    calculateUEQScore(ueqResponses, weights) {
        const dimensions = Object.keys(weights);
        const dimensionScores = dimensions.map((dimension, index) => {
            const weight = weights[dimension];
            return ueqResponses[index] * weight;
        });
        const ueqScore = dimensionScores.reduce((sum, score) => sum + score, 0) / dimensions.length;
        return ueqScore;
    }
}

const userProfile = {
    age: 35,
    gender: 'male',
    education: 'bachelors',
    occupation: 'office_worker',
    uiPreference: 'minimal',
    interactionPreference: 'keyboard'
};

const behaviorData = {
    susResponses: [4, 2, 5, 1, 4, 2, 5, 1, 4, 2],
    ueqResponses: [5, 4, 3, 4, 5, 3]
};

const calculator = new PersonalizedScoreCalculator();
const result = calculator.calculatePersonalizedScore(behaviorData, userProfile);

console.log('Adjusted Weights:', result.appliedWeights);
console.log('SUS Score:', result.sus);
console.log('UEQ Score:', result.ueq);

export { analyzeUserExperience, getUXEvaluation };
export default getUXEvaluation;