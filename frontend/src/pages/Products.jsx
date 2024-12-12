import styled from 'styled-components';
import { PageTitle, Card, Button } from '../components/shared/StyledComponents';

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.medium};
`;

const ProductCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  h2 {
    margin-bottom: ${props => props.theme.spacing.small};
  }
  
  p {
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing.medium};
  }
`;

const Products = () => {
  const products = [
    { id: 1, name: 'Product A', price: '$99' },
    { id: 2, name: 'Product B', price: '$149' },
    { id: 3, name: 'Product C', price: '$199' },
  ];

  return (
    <div>
      <PageTitle>Our Products</PageTitle>
      <ProductGrid>
        {products.map(product => (
          <ProductCard key={product.id} className="hover-tracked">
            <h2>{product.name}</h2>
            <p>{product.price}</p>
            <Button>Add to Cart</Button>
          </ProductCard>
        ))}
      </ProductGrid>
    </div>
  );
};

export default Products;