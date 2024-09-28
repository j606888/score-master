import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import styled from 'styled-components'

export default function LoadingSkeleton() {
  const [isReady, setIsReady] = React.useState(false);

  // This is a workaround to prevent the css style not effect.
  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null;

  return (
    <Container>
      <Stack spacing={1}>
      {/* For variant="text", adjust the height via font-size */}
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

      {/* For other variants, adjust the size with `width` and `height` */}
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width={210} height={60} />
        <Skeleton variant="rounded" width={210} height={60} />
      </Stack>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`