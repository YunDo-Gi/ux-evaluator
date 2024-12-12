const fetchSessionData = async (sessionId) => {
    try {
      const emotionsResponse = await fetch(`/api/sessions/${sessionId}/emotions`);
      const emotions = await emotionsResponse.json();
  
      const behaviorsResponse = await fetch(`/api/sessions/${sessionId}/behaviors`);
      const behaviors = await behaviorsResponse.json();
  
      return {
        emotions,
        behaviors,
        sessionId
      };
    } catch (error) {
      console.error('Error fetching session data:', error);
      throw error;
    }
  };
  
  const fetchPeriodData = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `/api/analytics/period?startDate=${startDate}&endDate=${endDate}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching period data:', error);
      throw error;
    }
  };
  
  export { fetchSessionData, fetchPeriodData };