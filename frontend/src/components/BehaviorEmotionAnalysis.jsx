/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts';

// eslint-disable-next-line react/prop-types
const BehaviorEmotionAnalysis = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisContext, setAnalysisContext] = useState(null);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [emotionsRes, behaviorsRes] = await Promise.all([
          fetch(`/api/sessions/${sessionId}/emotions`),
          fetch(`/api/sessions/${sessionId}/behaviors`)
        ]);
        
        const emotions = await emotionsRes.json();
        const behaviors = await behaviorsRes.json();
        console.log(emotions, behaviors);
        setSessionData({ emotions, behaviors });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  // 행동-감정 패턴 분석
  const analyzeBehaviorEmotionPatterns = useMemo(() => {
    if (!sessionData) return null;

    const { emotions, behaviors } = sessionData;
    
    // 페이지별 감정 상태 분석
    const pageEmotionPatterns = behaviors.pageTimeSpent.map(page => {
      const pageEmotions = emotions.pageEmotions.filter(e => e.path === page.path);
      const dominantEmotion = pageEmotions.reduce((prev, current) => 
        (current.count > prev.count) ? current : prev
      , { count: 0 });

      return {
        path: page.path,
        avgDuration: page.avg_duration,
        visitCount: page.visit_count,
        dominantEmotion: dominantEmotion.emotion_type,
        emotionConfidence: dominantEmotion.avg_confidence
      };
    });

    // 클릭 이벤트와 감정 상태 연관 분석
    const clickEmotionPatterns = behaviors.clickHeatmap.map(click => {
      const nearestEmotion = emotions.emotionTimeline.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.timestamp) - new Date(click.timestamp));
        const currDiff = Math.abs(new Date(curr.timestamp) - new Date(click.timestamp));
        return prevDiff < currDiff ? prev : curr;
      });

      return {
        ...click,
        emotion: nearestEmotion.emotion_type,
        emotionConfidence: nearestEmotion.avg_confidence
      };
    });

    // 스크롤 패턴과 감정 상태 분석
    const scrollEmotionPatterns = behaviors.scrollPatterns.map(pattern => {
      const scrollEmotions = emotions.emotionTimeline.filter(e => 
        e.timestamp >= pattern.start_time && e.timestamp <= pattern.end_time
      );

      const avgEmotionConfidence = scrollEmotions.reduce((sum, emotion) => 
        sum + emotion.avg_confidence, 0) / scrollEmotions.length;

      return {
        ...pattern,
        emotions: scrollEmotions,
        avgEmotionConfidence
      };
    });

    // 행동-감정 패턴 요약
    const patterns = {
      pagePatterns: pageEmotionPatterns,
      clickPatterns: clickEmotionPatterns,
      scrollPatterns: scrollEmotionPatterns,
      overallEmotions: emotions.clickEmotions
    };

    return patterns;
  }, [sessionData]);

  // 컨텍스트 생성
  const generateContext = useMemo(() => {
    if (!analysisContext) return null;

    const { pagePatterns, clickPatterns, scrollPatterns, overallEmotions } = analysisContext;

    // 주요 감정 상태 식별
    const dominantEmotions = overallEmotions
      .sort((a, b) => b.count - a.count)
      .slice(0, 2);

    // 문제가 있는 페이지 식별 (부정적 감정이 dominant한 페이지)
    const problematicPages = pagePatterns.filter(page => 
      ['Anger', 'Sadness', 'Disgust'].includes(page.dominantEmotion)
    );

    // 긍정적인 상호작용이 많은 페이지 식별
    const positivePages = pagePatterns.filter(page =>
      ['Happiness', 'Joy'].includes(page.dominantEmotion)
    );

    // 사용자 참여도가 높은 영역 식별
    const highEngagementAreas = clickPatterns
      .filter(click => click.click_count > 5)
      .map(click => ({
        x: click.x,
        y: click.y,
        count: click.click_count,
        emotion: click.emotion
      }));

    return {
      sessionOverview: {
        dominantEmotions,
        totalInteractions: clickPatterns.length + scrollPatterns.length,
        averageEmotionConfidence: overallEmotions.reduce((sum, e) => 
          sum + e.avg_confidence, 0) / overallEmotions.length
      },
      pageAnalysis: {
        problematicPages,
        positivePages,
        averageTimeSpent: pagePatterns.reduce((sum, p) => 
          sum + p.avgDuration, 0) / pagePatterns.length
      },
      interactionAnalysis: {
        highEngagementAreas,
        scrollBehavior: scrollPatterns
      }
    };
  }, [analysisContext]);

  if (loading) return <div className="w-full h-96 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!sessionData || !analysisContext) return null;

  return (
    <div className="space-y-8">
      {/* 감정-행동 타임라인 */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Emotion-Behavior Timeline</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sessionData.emotions.emotionTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(sessionData.emotions.emotionTimeline[0] || {})
              .filter(key => key !== 'timestamp')
              .map((emotion, index) => (
                <Line
                  key={emotion}
                  type="monotone"
                  dataKey={emotion}
                  stroke={`hsl(${index * 45}, 70%, 50%)`}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 페이지별 감정-체류시간 분석 */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Page Emotion Analysis</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analysisContext.pagePatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="path" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="avgDuration" 
              fill="#8884d8" 
              name="Average Duration (s)" 
            />
            <Bar 
              yAxisId="right"
              dataKey="emotionConfidence" 
              fill="#82ca9d" 
              name="Emotion Confidence" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 분석 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Problematic Areas</h3>
          <div className="space-y-4">
            {analysisContext.pageAnalysis.problematicPages.map(page => (
              <div key={page.path} className="border-l-4 border-red-500 pl-4">
                <div className="font-medium">{page.path}</div>
                <div className="text-sm text-gray-600">
                  Dominant Emotion: {page.dominantEmotion}
                  <br />
                  Confidence: {Math.round(page.emotionConfidence * 100)}%
                  <br />
                  Avg. Duration: {Math.round(page.avgDuration)}s
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Positive Interactions</h3>
          <div className="space-y-4">
            {analysisContext.pageAnalysis.positivePages.map(page => (
              <div key={page.path} className="border-l-4 border-green-500 pl-4">
                <div className="font-medium">{page.path}</div>
                <div className="text-sm text-gray-600">
                  Dominant Emotion: {page.dominantEmotion}
                  <br />
                  Confidence: {Math.round(page.emotionConfidence * 100)}%
                  <br />
                  Avg. Duration: {Math.round(page.avgDuration)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorEmotionAnalysis;