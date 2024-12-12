const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const dbConfig = require('../config/database');
const pool = mysql.createPool(dbConfig);

// 세션 생성
router.post('/sessions', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const { userId, deviceInfo } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'INSERT INTO sessions (session_id, user_id, device_info) VALUES (?, ?, ?)',
        [sessionId, userId, JSON.stringify(deviceInfo)]
      );
      
      res.json({ sessionId });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// 트래킹 데이터 저장
router.post('/tracking/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { mouseData, clickData, scrollData, hoverData, pageData } = req.body;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 마우스 이동 데이터 저장
      if (mouseData?.length > 0) {
        const mouseValues = mouseData.map(data => [
          sessionId,
          data.x,
          data.y,
          data.path,
          new Date(data.timestamp),
          data.emotion?.emotion || 'Neutral',
          data.emotion?.confidence || 0
        ]);

        await connection.query(
          `INSERT INTO mouse_movements 
           (session_id, x, y, path, timestamp, emotion_type, emotion_confidence) 
           VALUES ?`,
          [mouseValues]
        );
      }

      // 클릭 데이터 저장
      if (clickData?.length > 0) {
        const clickValues = clickData.map(data => [
          sessionId,
          data.x,
          data.y,
          JSON.stringify(data.element),
          data.path,
          new Date(data.timestamp),
          data.emotion?.emotion || 'Neutral',
          data.emotion?.confidence || 0
        ]);

        await connection.query(
          `INSERT INTO clicks 
           (session_id, x, y, element_info, path, timestamp, emotion_type, emotion_confidence) 
           VALUES ?`,
          [clickValues]
        );
      }

      // 스크롤 데이터 저장
      if (scrollData?.length > 0) {
        const scrollValues = scrollData.map(data => [
          sessionId,
          data.scrollX,
          data.scrollY,
          data.path,
          new Date(data.timestamp),
          data.emotion?.emotion || 'Neutral',
          data.emotion?.confidence || 0
        ]);

        await connection.query(
          `INSERT INTO scroll_events 
           (session_id, scroll_x, scroll_y, path, timestamp, emotion_type, emotion_confidence) 
           VALUES ?`,
          [scrollValues]
        );
      }

      // 호버 이벤트 데이터 저장
      if (hoverData?.length > 0) {
        const hoverValues = hoverData.map(data => [
          sessionId,
          JSON.stringify(data.element),
          new Date(data.startTime),
          data.endTime ? new Date(data.endTime) : null,
          data.duration,
          data.path,
          data.emotion?.emotion || 'Neutral',
          data.emotion?.confidence || 0,
          data.endEmotion?.emotion,
          data.endEmotion?.confidence
        ]);

        await connection.query(
          `INSERT INTO hover_events 
           (session_id, element_info, start_time, end_time, duration, path, 
            start_emotion_type, start_emotion_confidence, end_emotion_type, end_emotion_confidence) 
           VALUES ?`,
          [hoverValues]
        );
      }

      // 페이지 조회 데이터 저장
      if (pageData?.length > 0) {
        const pageValues = pageData.map(data => [
          sessionId,
          data.path,
          new Date(data.startTime),
          data.endTime ? new Date(data.endTime) : null,
          data.duration,
          data.type,
          data.emotion?.emotion || 'Neutral',
          data.emotion?.confidence || 0
        ]);

        await connection.query(
          `INSERT INTO page_views 
           (session_id, path, start_time, end_time, duration, type, emotion_type, emotion_confidence) 
           VALUES ?`,
          [pageValues]
        );
      }

      await connection.commit();
      res.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error saving tracking data:', error);
    res.status(500).json({ error: 'Failed to save tracking data' });
  }
});

// 세션 종료
router.put('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE sessions SET end_time = CURRENT_TIMESTAMP WHERE session_id = ?',
        [sessionId]
      );
      
      res.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// 세션 데이터 조회 (분석용)
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // 세션 기본 정보 조회
      const [sessionInfo] = await connection.query(
        'SELECT * FROM sessions WHERE session_id = ?',
        [sessionId]
      );

      // 해당 세션의 모든 트래킹 데이터 조회
      const [mouseData] = await connection.query(
        'SELECT * FROM mouse_movements WHERE session_id = ? ORDER BY timestamp',
        [sessionId]
      );

      const [clickData] = await connection.query(
        'SELECT * FROM clicks WHERE session_id = ? ORDER BY timestamp',
        [sessionId]
      );

      const [scrollData] = await connection.query(
        'SELECT * FROM scroll_events WHERE session_id = ? ORDER BY timestamp',
        [sessionId]
      );

      const [hoverData] = await connection.query(
        'SELECT * FROM hover_events WHERE session_id = ? ORDER BY start_time',
        [sessionId]
      );

      const [pageData] = await connection.query(
        'SELECT * FROM page_views WHERE session_id = ? ORDER BY start_time',
        [sessionId]
      );

      res.json({
        sessionInfo: sessionInfo[0],
        trackingData: {
          mouseData,
          clickData,
          scrollData,
          hoverData,
          pageData
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching session data:', error);
    res.status(500).json({ error: 'Failed to fetch session data' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [sessions] = await connection.query(
        `SELECT session_id, user_id, start_time, end_time,
         device_info FROM sessions ORDER BY start_time DESC`
      );
      res.json({ sessions });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// 세션 목록 조회
router.get('/sessions', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      try {
        const [sessions] = await connection.query(
          `SELECT session_id, user_id, start_time, end_time,
           device_info FROM sessions ORDER BY start_time DESC`
        );
        res.json({ sessions });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });
  
  // 특정 세션의 감정 데이터 분석
  router.get('/sessions/:sessionId/emotions', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const connection = await pool.getConnection();
      
      try {
        // 클릭 이벤트의 감정 분석
        const [clickEmotions] = await connection.query(
          `SELECT emotion_type, 
           COUNT(*) as count,
           AVG(emotion_confidence) as avg_confidence
           FROM clicks 
           WHERE session_id = ?
           GROUP BY emotion_type`,
          [sessionId]
        );
  
        // 페이지별 감정 분석
        const [pageEmotions] = await connection.query(
          `SELECT path,
           emotion_type,
           COUNT(*) as count,
           AVG(emotion_confidence) as avg_confidence
           FROM page_views
           WHERE session_id = ?
           GROUP BY path, emotion_type`,
          [sessionId]
        );
  
        // 시간대별 감정 변화
        const [emotionTimeline] = await connection.query(
          `SELECT 
             HOUR(timestamp) as hour,
             emotion_type,
             COUNT(*) as count,
             AVG(emotion_confidence) as avg_confidence
           FROM mouse_movements
           WHERE session_id = ?
           GROUP BY HOUR(timestamp), emotion_type
           ORDER BY hour`,
          [sessionId]
        );
  
        res.json({
          clickEmotions,
          pageEmotions,
          emotionTimeline
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      res.status(500).json({ error: 'Failed to analyze emotions' });
    }
  });
  
  // 세션의 행동 데이터 분석
  router.get('/sessions/:sessionId/behaviors', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const connection = await pool.getConnection();
      
      try {
        // 페이지별 체류 시간
        const [pageTimeSpent] = await connection.query(
          `SELECT path,
           COUNT(*) as visit_count,
           AVG(TIMESTAMPDIFF(SECOND, start_time, COALESCE(end_time, start_time))) as avg_duration
           FROM page_views
           WHERE session_id = ?
           GROUP BY path`,
          [sessionId]
        );
  
        // 클릭 히트맵 데이터
        const [clickHeatmap] = await connection.query(
          `SELECT x, y, COUNT(*) as click_count
           FROM clicks
           WHERE session_id = ?
           GROUP BY x, y`,
          [sessionId]
        );
  
        // 스크롤 패턴
        const [scrollPatterns] = await connection.query(
          `SELECT path,
           AVG(scroll_y) as avg_scroll_depth,
           MAX(scroll_y) as max_scroll_depth
           FROM scroll_events
           WHERE session_id = ?
           GROUP BY path`,
          [sessionId]
        );
  
        // 호버 이벤트 분석
        const [hoverPatterns] = await connection.query(
          `SELECT 
             element_info,
             COUNT(*) as hover_count,
             AVG(duration) as avg_duration
           FROM hover_events
           WHERE session_id = ?
           GROUP BY element_info`,
          [sessionId]
        );
  
        res.json({
          pageTimeSpent,
          clickHeatmap,
          scrollPatterns,
          hoverPatterns
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error analyzing behaviors:', error);
      res.status(500).json({ error: 'Failed to analyze behaviors' });
    }
  });
  
  // 기간별 분석
  router.get('/analytics/period', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const connection = await pool.getConnection();
      
      try {
        // 기간 내 세션 수
        const [sessionStats] = await connection.query(
          `SELECT 
             COUNT(DISTINCT session_id) as total_sessions,
             COUNT(DISTINCT user_id) as unique_users
           FROM sessions
           WHERE start_time BETWEEN ? AND ?`,
          [startDate, endDate]
        );
  
        // 감정 분포
        const [emotionDistribution] = await connection.query(
          `SELECT 
             emotion_type,
             COUNT(*) as count
           FROM mouse_movements
           WHERE timestamp BETWEEN ? AND ?
           GROUP BY emotion_type`,
          [startDate, endDate]
        );
  
        // 시간대별 사용자 활동
        const [hourlyActivity] = await connection.query(
          `SELECT 
             HOUR(timestamp) as hour,
             COUNT(*) as activity_count
           FROM mouse_movements
           WHERE timestamp BETWEEN ? AND ?
           GROUP BY HOUR(timestamp)
           ORDER BY hour`,
          [startDate, endDate]
        );
  
        res.json({
          sessionStats,
          emotionDistribution,
          hourlyActivity
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error analyzing period data:', error);
      res.status(500).json({ error: 'Failed to analyze period data' });
    }
  });

module.exports = router;