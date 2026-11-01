import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { App } from './app/App';
import { ApplicationsProvider } from './components/ApplicationsProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { applyLook, readStoredLook } from './lib/look';
import './index.css';

applyLook(readStoredLook());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NuqsAdapter>
      <ThemeProvider>
        <ApplicationsProvider>
          <App />
        </ApplicationsProvider>
      </ThemeProvider>
    </NuqsAdapter>
  </StrictMode>,
);
