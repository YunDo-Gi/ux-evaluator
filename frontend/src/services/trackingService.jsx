const API_BASE_URL = 'http://localhost:3001/api';

export const createSession = async (userId = 'anonymous') => {
  try {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };

    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        deviceInfo
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const saveTrackingData = async (sessionId, trackingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tracking/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData)
    });

    if (!response.ok) {
      throw new Error('Failed to save tracking data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving tracking data:', error);
    throw error;
  }
};

export const endSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/end`, {
      method: 'PUT'
    });

    if (!response.ok) {
      throw new Error('Failed to end session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};