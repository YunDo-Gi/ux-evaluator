class EmotionAnalyzer {
    constructor() {
        this.emotionHistory = [];
        this.emotionChangeThreshold = 0.3; // 감정 변화 감지 임계값
    }

    analyzeEmotionalState(emotionData) {
        const dominantEmotion = this.findDominantEmotion(emotionData);
        const emotionChanges = this.detectEmotionChanges(emotionData);
        const stressIndicators = this.analyzeStressIndicators(emotionData);

        return {
            dominantEmotion,
            emotionChanges,
            stressIndicators,
            emotionDistribution: this.calculateEmotionDistribution(emotionData)
        };
    }

    findDominantEmotion(emotionData) {
        const emotionCounts = emotionData.reduce((acc, data) => {
            acc[data.emotion] = (acc[data.emotion] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(emotionCounts)
            .sort(([, a], [, b]) => b - a)[0][0];
    }

    detectEmotionChanges(emotionData) {
        const changes = [];
        let lastEmotion = emotionData[0]?.emotion;
        let lastConfidence = emotionData[0]?.confidence;

        emotionData.forEach((data, index) => {
            if (index === 0) return;

            if (data.emotion !== lastEmotion && 
                Math.abs(data.confidence - lastConfidence) > this.emotionChangeThreshold) {
                changes.push({
                    from: lastEmotion,
                    to: data.emotion,
                    timestamp: data.timestamp,
                    confidenceChange: data.confidence - lastConfidence
                });
            }

            lastEmotion = data.emotion;
            lastConfidence = data.confidence;
        });

        return changes;
    }

    analyzeStressIndicators(emotionData) {
        const stressIndicators = {
            emotionalVolatility: 0,
            negativeEmotionFrequency: 0,
            rapidChanges: 0
        };

        // 감정 변화의 빈도 계산
        const changes = this.detectEmotionChanges(emotionData);
        stressIndicators.emotionalVolatility = changes.length / (emotionData.length / 60); // 분당 변화 횟수

        // 부정적 감정의 빈도
        const negativeEmotions = emotionData.filter(data => 
            ['anger', 'sadness'].includes(data.emotion)
        ).length;
        stressIndicators.negativeEmotionFrequency = negativeEmotions / emotionData.length;

        // 급격한 감정 변화 횟수
        stressIndicators.rapidChanges = changes.filter(change => 
            Math.abs(change.confidenceChange) > this.emotionChangeThreshold * 2
        ).length;

        return stressIndicators;
    }

    calculateEmotionDistribution(emotionData) {
        const emotionCounts = emotionData.reduce((acc, data) => {
            acc[data.emotion] = (acc[data.emotion] || 0) + 1;
            return acc;
        }, {});

        const total = Object.values(emotionCounts).reduce((a, b) => a + b);
        return Object.entries(emotionCounts).map(([emotion, count]) => ({
            emotion,
            percentage: (count / total) * 100
        }));
    }
}

export default EmotionAnalyzer;