import { PageTitle, Card, Button } from '../components/shared/StyledComponents';

const About = () => {
  return (
    <div>
      <PageTitle>About Us</PageTitle>
      <Card className="hover-tracked">
        <h2>Our Story</h2>
        <p>Learn about our company's journey and mission to provide the best user experience.</p>
      </Card>
      <Card className="hover-tracked">
        <h2>Contact Us</h2>
        <p>Get in touch with us for any questions or concerns.</p>
        <Button>Contact</Button>
      </Card>
    </div>
  );
};

export default About;