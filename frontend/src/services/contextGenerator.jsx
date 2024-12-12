/* eslint-disable no-unused-vars */
const extractUXInsights = (behaviorPatterns) => {
    const { pagePatterns, interactionPatterns, scrollPatterns, overallEngagement } = behaviorPatterns;
  
    const problematicPages = pagePatterns.filter(page => 
      ['Anger', 'Sadness'].includes(page.dominantEmotion) ||
      page.emotionalEngagement < 0.3
    );
  
    const successfulInteractions = interactionPatterns.filter(interaction =>
      ['Happiness'].includes(interaction.emotion) &&
      interaction.emotionConfidence > 0.7
    );
  
    const confusionPoints = interactionPatterns.filter(interaction =>
      interaction.emotion === 'Confusion' &&
      interaction.interactionContext.isNavigational
    );
  
    const engagementPatterns = analyzeEngagementPatterns(behaviorPatterns);
  
    return {
      problematicPages,
      successfulInteractions,
      confusionPoints,
      engagementPatterns,
      overallEngagement
    };
  };
  
  const generateContext = (insights, sessionData) => {
    return {
      generalContext: generateGeneralContext(insights, sessionData),
      specificInsights: generateSpecificInsights(insights),
      recommendationContext: generateRecommendationContext(insights)
    };
  };
  
  const analyzeEngagementPatterns = (behaviorPatterns) => {
    const { pagePatterns, scrollPatterns } = behaviorPatterns;
    
    return pagePatterns.map(page => ({
      path: page.path,
      engagementMetrics: {
        timeSpent: page.averageDuration,
        emotionalEngagement: page.emotionalEngagement,
        scrollBehavior: scrollPatterns.find(s => s.path === page.path)?.scrollBehavior || 'normal',
        interactionQuality: calculateInteractionQuality(page)
      }
    }));
  };
  
  const calculateInteractionQuality = (page) => {
    const score = (page.emotionalEngagement * 0.4) + 
                  (page.visitCount / 100 * 0.3) + 
                  (page.averageDuration / 300 * 0.3);
    return score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
  };
  
  const generateGeneralContext = (insights, sessionData) => {
    const { overallEngagement } = insights;
    
    return `
  Session Overview:
  - Total Interactions: ${overallEngagement.totalInteractions}
  - Average Emotional Engagement: ${Math.round(overallEngagement.averageEmotionConfidence * 100)}%
  - Overall Engagement Score: ${Math.round(overallEngagement.engagementScore)}
  - Session Duration: ${calculateSessionDuration(sessionData)} minutes
    `;
  };
  
  const generateSpecificInsights = (insights) => {
    const { problematicPages, successfulInteractions, confusionPoints } = insights;
    
    return `
  Specific Findings:
  
  1. Problematic Areas:
  ${problematicPages.map(page => `
  - Page: ${page.path}
    * Dominant Emotion: ${page.dominantEmotion}
    * Engagement Level: ${Math.round(page.emotionalEngagement * 100)}%
    * Average Time Spent: ${Math.round(page.averageDuration)}s`).join('\n')}
  
  2. Successful Interactions:
  ${successfulInteractions.map(interaction => `
  - Location: (${interaction.x}, ${interaction.y})
    * Context: ${interaction.interactionContext.isNavigational ? 'Navigation' : 
                interaction.interactionContext.isFormInteraction ? 'Form Input' : 'Content Interaction'}
    * Emotion: ${interaction.emotion}
    * Confidence: ${Math.round(interaction.emotionConfidence * 100)}%`).join('\n')}
  
  3. Confusion Points:
  ${confusionPoints.map(point => `
  - Location: ${point.element}
    * Type: ${point.interactionContext.isNavigational ? 'Navigation Element' : 'Other Element'}
    * Confidence: ${Math.round(point.emotionConfidence * 100)}%`).join('\n')}
    `;
  };
  
  const generateRecommendationContext = (insights) => {
    const { problematicPages, confusionPoints, engagementPatterns } = insights;
    
    return `
  Recommendation Context:
  
  1. Priority Areas for Improvement:
  ${problematicPages.map(page => `
  - ${page.path}: 
    * Current Issue: ${page.dominantEmotion} emotion with ${Math.round(page.emotionalEngagement * 100)}% engagement
    * Usage Context: ${page.visitCount} visits, ${Math.round(page.averageDuration)}s average duration`).join('\n')}
  
  2. Navigation Issues:
  ${confusionPoints.map(point => `
  - Element: ${point.element}
    * Issue Type: Confusion during navigation
    * Context: ${JSON.stringify(point.interactionContext)}`).join('\n')}
  
  3. Engagement Optimization Opportunities:
  ${engagementPatterns.filter(p => p.engagementMetrics.interactionQuality !== 'high').map(pattern => `
  - ${pattern.path}:
    * Current Quality: ${pattern.engagementMetrics.interactionQuality}
    * Time Spent: ${Math.round(pattern.engagementMetrics.timeSpent)}s
    * Scroll Behavior: ${pattern.engagementMetrics.scrollBehavior}`).join('\n')}
    `;
  };
  
  const calculateSessionDuration = (sessionData) => {
    const startTime = new Date(sessionData.behaviors.pageTimeSpent[0]?.start_time);
    const endTime = new Date(sessionData.behaviors.pageTimeSpent[sessionData.behaviors.pageTimeSpent.length - 1]?.end_time);
    return Math.round((endTime - startTime) / 1000 / 60);
  };
  
  export { generateContext };