import BehaviorAnalyzer from './behaviorAnalyzer';
import EmotionAnalyzer from './emotionAnalyzer';
import ContextGenerator from './contextGenerator';

class IntegratedAnalyzer {
    constructor() {
        this.behaviorAnalyzer = new BehaviorAnalyzer();
        this.emotionAnalyzer = new EmotionAnalyzer();
        this.contextGenerator = new ContextGenerator();
    }

    async analyzeSession(sessionData) {
        const behaviorAnalysis = this.behaviorAnalyzer.analyzeBehavior(sessionData.behaviors);
        
        const emotionAnalysis = this.emotionAnalyzer.analyzeEmotionalState(sessionData.emotions);

        const integratedResults = this.integrateResults(behaviorAnalysis, emotionAnalysis);

        const prompts = this.contextGenerator.generatePrompt(integratedResults);

        return {
            behaviorAnalysis,
            emotionAnalysis,
            integratedResults,
            prompts
        };
    }

    integrateResults(behaviorAnalysis, emotionAnalysis) {
        const correlations = this.analyzeTemporalCorrelations(
            behaviorAnalysis.frictionPoints,
            emotionAnalysis.emotionChanges
        );

        const issuesSeverity = this.evaluateIssuesSeverity(
            behaviorAnalysis.frictionPoints,
            emotionAnalysis.stressIndicators
        );

        return {
            correlations,
            issuesSeverity,
            overallAssessment: this.generateOverallAssessment(
                behaviorAnalysis,
                emotionAnalysis,
                correlations,
                issuesSeverity
            )
        };
    }

    analyzeTemporalCorrelations(frictionPoints, emotionChanges) {
        const correlations = [];
        const timeWindow = 5000;

        frictionPoints.forEach(friction => {
            const relatedEmotions = emotionChanges.filter(emotion => 
                Math.abs(emotion.timestamp - friction.timestamp) <= timeWindow
            );

            if (relatedEmotions.length > 0) {
                correlations.push({
                    frictionPoint: friction,
                    emotionalResponses: relatedEmotions,
                    timeGap: Math.min(...relatedEmotions.map(e => 
                        Math.abs(e.timestamp - friction.timestamp)
                    ))
                });
            }
        });

        return correlations;
    }

    evaluateIssuesSeverity(frictionPoints, stressIndicators) {
        return frictionPoints.map(point => ({
            ...point,
            severity: this.calculateIssueSeverity(point, stressIndicators)
        }));
    }

    calculateIssueSeverity(frictionPoint, stressIndicators) {
        let severityScore = 3;

        if (stressIndicators.emotionalVolatility > 0.5) severityScore += 1;
        if (stressIndicators.negativeEmotionFrequency > 0.3) severityScore += 1;

        switch (frictionPoint.type) {
            case 'RAGE_CLICKS':
                severityScore += 1;
                break;
            case 'SCROLL_CONFUSION':
                if (frictionPoint.directionChanges > 5) severityScore += 1;
                break;
        }

        return Math.min(Math.max(severityScore, 1), 5);
    }
}

export default IntegratedAnalyzer;