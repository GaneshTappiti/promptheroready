import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.tsx loading...');

// Client-side only initialization
const initializeClientSide = async () => {
  // Only run on client side
  if (typeof window === 'undefined') return;

  try {
    // Initialize performance optimizations
    const { QueryOptimizationService } = await import('./services/queryOptimizationService');
    QueryOptimizationService.initialize().catch(console.error);
  } catch (error) {
    console.warn('Failed to initialize QueryOptimizationService:', error);
  }

  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  console.log('New content is available; please refresh.');
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Client-side DOM setup
const setupClientDOM = () => {
  // Only run on client side
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    // Initialize dark mode before rendering
    document.documentElement.classList.add("dark");
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("theme", "dark");
    }

    // Prevent overscroll behavior on document
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    // Prevent pull-to-refresh on mobile
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';

    // Additional mobile optimizations
    document.body.style.touchAction = 'pan-x pan-y';
    (document.body.style as any).webkitTouchCallout = 'none';
    (document.body.style as any).webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';

    // Prevent zoom on double tap (iOS Safari)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  } catch (error) {
    console.warn('Error setting up DOM:', error);
  }
};

// Main rendering function
const renderApp = () => {
  try {
    console.log('About to create root...');

    // Create root and render app
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    console.log('Root created, about to render...');

    root.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error in main.tsx:', error);

    // Fallback rendering
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; background: red; color: white; font-family: Arial; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1>Error Loading App</h1>
          <p>Error: ${error instanceof Error ? (error as Error).message : 'Unknown error'}</p>
          <p>Check the console for more details.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: black; border: none; border-radius: 5px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
};

// Initialize everything
if (typeof window !== 'undefined') {
  setupClientDOM();
  renderApp();
  initializeClientSide();
} else {
  // Server-side: just render the app
  renderApp();
}

