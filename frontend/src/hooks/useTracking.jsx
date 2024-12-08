import { use } from 'react';
import { useState, useEffect } from 'react';

const useTracking = () => {
  const [mouseData, setMouseData] = useState([]);
  const [scrollData, setScrollData] = useState([]);

  useEffect(() => {
    let mouseTimeout;
    const mousePositions = [];

    const handleMouseMove = (e) => {
      clearTimeout(mouseTimeout);
      mousePositions.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });

      mouseTimeout = setTimeout(() => {
        if (mousePositions.length > 0) {
          setMouseData(prev => [...prev, ...mousePositions]);
          mousePositions.length = 0;
        }
      }, 500);
    };

    const handleScroll = () => {
      setScrollData(prev => [...prev, {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        timestamp: Date.now()
      }]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(mouseTimeout);
    };
  }, []);    

  useEffect(() => {
    console.log('Mouse Data:', mouseData);
    console.log('Scroll Data:', scrollData);
  }, [mouseData, scrollData]);

  return { mouseData, scrollData };
};

export default useTracking;