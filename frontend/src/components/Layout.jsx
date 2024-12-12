import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const Navigation = styled.nav`
  background-color: ${props => props.theme.colors.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: ${props => props.theme.spacing.medium};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.large};
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  padding: ${props => props.theme.spacing.small};
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 112, 243, 0.1);
  }
`;

const EndButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0051cc;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.large};
`;

// eslint-disable-next-line react/prop-types
const Layout = ({ children, onTaskComplete }) => {
  return (
    <Container>
      <Navigation>
        <NavContent>
          <NavLinks>
            <StyledLink to="/" className="hover-tracked">Home</StyledLink>
            <StyledLink to="/products" className="hover-tracked">Products</StyledLink>
            <StyledLink to="/about" className="hover-tracked">About</StyledLink>
          </NavLinks>
          <EndButton onClick={onTaskComplete} className="hover-tracked">
            End Session
          </EndButton>
        </NavContent>
      </Navigation>
      <MainContent>
        {children}
      </MainContent>
    </Container>
  );
};

export default Layout;