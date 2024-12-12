import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import useTracking from './hooks/useTracking';
import EmotionTracker from './components/EmotionTracker';
import GlobalStyle from './styles/GlobalStyle';
import { createSession, saveTrackingData, endSession } from './services/trackingService';
import BehaviorEmotionAnalysis from './components/BehaviorEmotionAnalysis';

const theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#6c757d',
    background: '#f8f9fa',
    white: '#ffffff',
    text: '#333333',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
};

const SAVE_INTERVAL = 5000; 

function App() {
  const { mouseData, scrollData, clickData, hoverData, pageData, updateEmotion } = useTracking();
  const [sessionId, setSessionId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 세션 시작
  useEffect(() => {
    const initSession = async () => {
      try {
        const newSessionId = await createSession();
        setSessionId(newSessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initSession();

    const handleBeforeUnload = () => {
      if (sessionId) {
        const formData = new FormData();
        navigator.sendBeacon(`http://localhost:3001/api/sessions/${sessionId}/end`, formData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sessionId) {
        endSession(sessionId).catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionId || isSaving) return;

    const saveInterval = setInterval(async () => {
      if (
        mouseData.length === 0 && 
        scrollData.length === 0 && 
        clickData.length === 0 && 
        hoverData.length === 0 && 
        pageData.length === 0
      ) {
        return;
      }

      setIsSaving(true);
      try {
        await saveTrackingData(sessionId, {
          mouseData,
          scrollData,
          clickData,
          hoverData,
          pageData
        });
      } catch (error) {
        console.error('Failed to save tracking data:', error);
      } finally {
        setIsSaving(false);
      }
    }, SAVE_INTERVAL);

    return () => clearInterval(saveInterval);
  }, [sessionId, mouseData, scrollData, clickData, hoverData, pageData, isSaving]);

  const handleTaskComplete = async () => {
    console.log(mouseData, scrollData, clickData, hoverData, pageData);
    if (!sessionId) return;

    setIsSaving(true);
    try {
      await saveTrackingData(sessionId, {
        mouseData,
        scrollData,
        clickData,
        hoverData,
        pageData
      });

      await endSession(sessionId);
      
      console.log('Task completed and data saved successfully');
    } catch (error) {
      console.error('Error saving final tracking data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmotionDetected = (emotionData) => {
    updateEmotion(emotionData);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <EmotionTracker onEmotionDetected={handleEmotionDetected}/>
        <Layout onTaskComplete={handleTaskComplete}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/analysis" element={<BehaviorEmotionAnalysis sessionId={"8406c227-a749-4872-9dc1-cc64795d01c7"} />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;