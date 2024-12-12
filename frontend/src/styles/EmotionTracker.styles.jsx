import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const VideoContainer = styled.div`
  position: relative;
  width: 320px;
  height: 240px;
  background-color: black;
`;

export const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: rotateY(180deg);
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-family: Arial, sans-serif;
`;

export const GraphContainer = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
`;

export const EmotionBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #333;
`;

export const Label = styled.span`
  width: 80px;
  margin-right: 0.5rem;
`;

export const BarContainer = styled.div`
  flex-grow: 1;
  height: 12px;
  background-color: #eee;
  border-radius: 6px;
  overflow: hidden;
`;

export const Bar = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${props => {
    switch (props.emotion) {
      case 'Happiness': return '#4CAF50';
      case 'Sadness': return '#2196F3';
      case 'Anger': return '#F44336';
      default: return '#9E9E9E';
    }
  }};
  transition: width 0.3s ease;
`;

export const Value = styled.span`
  width: 40px;
  margin-left: 0.5rem;
  text-align: right;
  font-family: monospace;
`;