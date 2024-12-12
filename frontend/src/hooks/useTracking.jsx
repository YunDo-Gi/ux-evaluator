import { useState, useEffect } from 'react';

const useTracking = () => {
  const [mouseData, setMouseData] = useState([]);
  const [scrollData, setScrollData] = useState([]);
  const [clickData, setClickData] = useState([]);
  const [hoverData, setHoverData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState({
    emotion: 'Neutral',
    confidence: 0,
    timestamp: new Date().toISOString()
  });
  
  useEffect(() => {
    const activeHovers = new Map();
    // eslint-disable-next-line no-unused-vars
    let lastMouseCapture = Date.now();
    let currentMousePosition = null;

    const getCurrentPath = () => window.location.pathname;

    const handleMouseMove = (e) => {
      const now = Date.now();
      currentMousePosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
        emotion: currentEmotion 
      };
    };

    const handleClick = (e) => {
      const element = e.target;
      const elementInfo = {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        text: element.textContent?.slice(0, 50)
      };

      setClickData(prev => [...prev, {
        x: e.clientX,
        y: e.clientY,
        element: elementInfo,
        timestamp: Date.now(),
        path: getCurrentPath(),
        emotion: currentEmotion 
      }]);
    };

    // Hover event tracking
    const handleMouseOver = (e) => {
      const element = e.target;
      
      if (!element.closest('.hover-tracked')) {
        return;
      }
      
      if (activeHovers.has(element)) {
        return;
      }

      const elementInfo = {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        text: element.textContent?.slice(0, 50)
      };

      const hoverInfo = {
        element: elementInfo,
        startTime: Date.now(),
        path: getCurrentPath(),
        emotion: currentEmotion 
      };

      activeHovers.set(element, hoverInfo);
      setHoverData(prev => [...prev, hoverInfo]);
    };

    const handleMouseOut = (e) => {
      const element = e.target;
      const hoverInfo = activeHovers.get(element);
      
      if (!hoverInfo) {
        return;
      }

      const endTime = Date.now();
      const duration = endTime - hoverInfo.startTime;

      setHoverData(prev => {
        const index = prev.findIndex(item => 
          item.startTime === hoverInfo.startTime && 
          item.element.tagName === hoverInfo.element.tagName
        );
        
        if (index === -1) return prev;

        const newData = [...prev];
        newData[index] = {
          ...hoverInfo,
          endTime,
          duration,
          endEmotion: currentEmotion 
        };
        
        return newData;
      });

      activeHovers.delete(element);
    };

    // Scroll tracking
    const handleScroll = () => {
      setScrollData(prev => [...prev, {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        timestamp: Date.now(),
        path: getCurrentPath(),
        emotion: currentEmotion 
      }]);
    };

    const handlePathChange = () => {
      setPageData(prev => {
        const currentPath = getCurrentPath();
        const lastPage = prev[prev.length - 1];
        
        if (lastPage && !lastPage.endTime && lastPage.path !== currentPath) {
          const updatedPrev = [...prev];
          updatedPrev[prev.length - 1] = {
            ...lastPage,
            endTime: Date.now(),
            duration: Date.now() - lastPage.startTime,
            type: 'pageLeave',
            endEmotion: currentEmotion 
          };
          
          return [...updatedPrev, {
            path: currentPath,
            startTime: Date.now(),
            type: 'pageEnter',
            emotion: currentEmotion
          }];
        }
        return prev;
      });
    };

    setPageData([{
      path: getCurrentPath(),
      startTime: Date.now(),
      type: 'pageEnter',
      emotion: currentEmotion
    }]);

    const mouseTimer = setInterval(() => {
      if (currentMousePosition) {
        setMouseData(prev => [...prev, {
          ...currentMousePosition,
          path: getCurrentPath()
        }]);
        lastMouseCapture = currentMousePosition.timestamp;
        currentMousePosition = null;
      }
    }, 1000);


    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePathChange);
      clearInterval(mouseTimer);
    };
  }, [currentEmotion]); 

  const updateEmotion = (emotionData) => {
    setCurrentEmotion(emotionData);
  };

  return {
    mouseData,
    scrollData,
    clickData,
    hoverData,
    pageData,
    updateEmotion 
  };
};

export default useTracking;