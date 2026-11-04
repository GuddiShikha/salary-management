import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const theme = createTheme({ primaryColor: 'indigo', defaultRadius: 'md' });

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" />
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
