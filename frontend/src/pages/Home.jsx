import { PageTitle, Card, Button, Grid } from '../components/shared/StyledComponents';

const Home = () => {
  return (
    <div>
      <PageTitle>Welcome to Our Website</PageTitle>
      <Card className="hover-tracked">
        <h2>Featured Content</h2>
        <p>This is our featured content section where we showcase important information.</p>
      </Card>
      <Grid>
        <Button className="hover-tracked">
          Learn More
        </Button>
        <Button className="hover-tracked" variant="secondary">
          Get Started
        </Button>
      </Grid>
    </div>
  );
};

export default Home;