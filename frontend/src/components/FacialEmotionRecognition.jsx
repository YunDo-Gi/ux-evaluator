import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FacialEmotionRecognition = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const containerRef = useRef();
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectionInterval, setDetectionInterval] = useState(null);

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
        width: 640,
        height: 480
      } 
    })
    .then(stream => {
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();
    })
    .catch(err => console.error('Error accessing webcam:', err));
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video
    canvas.width = video.width;
    canvas.height = video.height;

    const interval = setInterval(async () => {
      if (video && canvas) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections && detections.length > 0) {
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          detections.forEach(detection => {
            const expressions = detection.expressions;
            const dominantEmotion = Object.entries(expressions)
              .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
              
            let mappedEmotion;
            switch(dominantEmotion) {
              case 'happy':
                mappedEmotion = 'Happiness';
                break;
              case 'neutral':
                mappedEmotion = 'Neutral';
                break;
              case 'sad':
                mappedEmotion = 'Sadness';
                break;
              case 'angry':
                mappedEmotion = 'Anger';
                break;
              default:
                mappedEmotion = 'Neutral';
            }

            const box = detection.detection.box;
            context.strokeStyle = '#00ff00';
            context.lineWidth = 2;
            context.strokeRect(box.x, box.y, box.width, box.height);

            context.font = '24px Arial';
            context.fillStyle = '#00ff00';
            context.fillText(
              `${mappedEmotion} (${Math.round(expressions[dominantEmotion] * 100)}%)`,
              box.x,
              box.y - 10
            );
          });
        }
      }
    }, 1000);

    setDetectionInterval(interval);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div 
        ref={containerRef}
        className="relative w-[640px] h-[480px]"
      >
        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white z-10">
            Loading models...
          </div>
        )}
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          className="absolute top-0 left-0"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0"
        />
      </div>
      <div className="mt-4 text-gray-700">
        <p>Detecting emotions: Happiness, Neutral, Sadness, Anger</p>
      </div>
    </div>
  );
};

export default FacialEmotionRecognition;