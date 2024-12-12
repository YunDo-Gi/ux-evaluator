import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Container,
  VideoContainer,
  Video,
  LoadingOverlay
} from '../styles/EmotionTracker.styles';
import EmotionBarGraph from './EmotionBarGraph';

// eslint-disable-next-line react/prop-types
const EmotionTracker = ({ onEmotionDetected }) => {
  const videoRef = useRef();
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [emotionScores, setEmotionScores] = useState({
    Happiness: 0,
    Neutral: 0,
    Sadness: 0,
    Anger: 0
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelLoading(false);
        startVideo();
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      const video = videoRef.current;
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 320 },
        height: { ideal: 240 }
      } 
    })
    .then(stream => {
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();
    })
    .catch(err => console.error('Error accessing webcam:', err));
  };

  const updateEmotionScores = (expressions) => {
    const scores = {
      Happiness: Math.round(expressions.happy * 100) || 0,
      Neutral: Math.round(expressions.neutral * 100) || 0,
      Sadness: Math.round(expressions.sad * 100) || 0,
      Anger: Math.round(expressions.angry * 100) || 0
    };
    
    setEmotionScores(scores);
    
    const dominantEmotion = Object.entries(scores)
      .reduce((a, b) => (a[1] > b[1] ? a : b));

    onEmotionDetected({
      emotion: dominantEmotion[0],
      confidence: dominantEmotion[1],
      timestamp: new Date().toISOString()
    });
  };

  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections && detections.length > 0) {
          updateEmotionScores(detections[0].expressions);
        }
      }
    }, 1000);

    setDetectionInterval(interval);
  };

  return (
    <Container>
      <VideoContainer>
        {isModelLoading && (
          <LoadingOverlay>
            Loading...
          </LoadingOverlay>
        )}
        <Video
          ref={videoRef}
          width={320}
          height={240}
          autoPlay
          muted
          playsInline
          onPlay={handleVideoPlay}
        />
      </VideoContainer>
      <EmotionBarGraph emotionScores={emotionScores} />
    </Container>
  );
};

export default EmotionTracker;