import {
  GraphContainer,
  EmotionBar,
  Label,
  BarContainer,
  Bar,
  Value
} from '../styles/EmotionTracker.styles';

// eslint-disable-next-line react/prop-types
const EmotionBarGraph = ({ emotionScores }) => {
  const emotions = ['Happiness', 'Neutral', 'Sadness', 'Anger'];

  return (
    <GraphContainer>
      {emotions.map(emotion => (
        <EmotionBar key={emotion}>
          <Label>{emotion}</Label>
          <BarContainer>
            <Bar 
              emotion={emotion} 
              width={emotionScores[emotion]} 
            />
          </BarContainer>
          <Value>{emotionScores[emotion]}%</Value>
        </EmotionBar>
      ))}
    </GraphContainer>
  );
};

export default EmotionBarGraph;