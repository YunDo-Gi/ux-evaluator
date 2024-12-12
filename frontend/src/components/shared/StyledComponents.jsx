import styled from 'styled-components';

export const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.large};
`;

export const Card = styled.div`
  background-color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.large};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: ${props => props.theme.spacing.large};
`;

export const Button = styled.button`
  background-color: ${props => props.variant === 'secondary' 
    ? props.theme.colors.secondary 
    : props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 2}, 1fr);
  gap: ${props => props.theme.spacing.medium};
`;