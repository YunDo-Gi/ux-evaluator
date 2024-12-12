class SurveyContextGenerator {
    constructor() {
        this.templates = {
            sus: `
다음은 사용자의 행동 데이터입니다:
{behaviorData}

감정 상태 데이터:
{emotionData}

위 데이터를 바탕으로 SUS의 10가지 항목에 대한 점수를 1-5점 척도로 평가해주세요:
1. 시스템을 자주 사용하고 싶다
2. 시스템이 불필요하게 복잡하다
3. 시스템이 사용하기 쉽다
4. 시스템을 사용하기 위해 기술적인 도움이 필요하다
5. 시스템의 다양한 기능이 잘 통합되어 있다
6. 시스템이 일관성이 없다
7. 대부분의 사람들이 이 시스템의 사용법을 빨리 배울 것이다
8. 시스템을 사용하기에 번거롭다
9. 시스템을 사용하는 데 자신감이 있다
10. 이 시스템을 사용하기 전에 많은 것을 배워야 한다

각 항목에 대한 점수와 함께 근거를 설명해주세요.`,

            ueqs: `
다음은 사용자의 행동 및 감정 데이터입니다:
{behaviorData}
{emotionData}

위 데이터를 바탕으로 UEQ-S의 8가지 항목에 대해 -3에서 +3 사이의 점수로 평가해주세요:
1. 방해되는 - 도움되는
2. 복잡한 - 간단한
3. 비효율적인 - 효율적인
4. 혼란스러운 - 명확한
5. 지루한 - 흥미로운
6. 재미없는 - 재미있는
7. 기존의 - 혁신적인
8. 일반적인 - 독창적인

각 항목에 대한 점수와 함께 평가 근거를 설명해주세요.`,
        };
    }

    generatePrompt(analysisResults) {
        const behaviorData = this.formatBehaviorData(analysisResults.behavior);
        const emotionData = this.formatEmotionData(analysisResults.emotion);

        const susPrompt = this.templates.sus
            .replace("{behaviorData}", behaviorData)
            .replace("{emotionData}", emotionData);

        const ueqsPrompt = this.templates.ueqs
            .replace("{behaviorData}", behaviorData)
            .replace("{emotionData}", emotionData);

        return {
            sus: susPrompt,
            ueqs: ueqsPrompt,
        };
    }

    formatBehaviorData(behaviorData) {
        return `
행동 데이터:
- 방문한 페이지 수: ${behaviorData.pageCount}
- 평균 체류 시간: ${behaviorData.averageDuration}초
- 방문한 페이지 패턴:
${behaviorData.pagePatterns
    .map(
        (page) => `
  * 페이지: ${page.path}
    - 평균 체류 시간: ${page.avgDuration}초
    - 감정 상태: ${page.emotion}`
    )
    .join("")}
        `;
    }

    formatEmotionData(emotionData) {
        return `
감정 데이터:
- 감정 변화 패턴:
${emotionData.emotionChanges
    .map(
        (emotion) => `
  * 시간: ${emotion.timestamp}
    - 감정: ${emotion.emotion}`
    )
    .join("")}
- 주요 감정: ${emotionData.dominantEmotion}
- 감정 분포:
${Object.entries(emotionData.emotionDistribution)
    .map(
        ([emotion, count]) => `
  * 감정: ${emotion}
    - 빈도: ${count}`
    )
    .join("")}
        `;
    }

    generateSurveyContext(analysisResults) {
        return this.generatePrompt(analysisResults);
    }
}

export default SurveyContextGenerator;
