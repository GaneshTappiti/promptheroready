import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DebugApp from './components/debug/DebugApp';
import './index.css';

console.log('🚀 main.tsx loading...');

// Enhanced error handling and debugging
window.addEventListener('error', (event) => {
  console.error('🔥 Global JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled Promise Rejection:', event.reason);
});

// Client-side only initialization
const initializeClientSide = async () => {
  // Only run on client side
  if (typeof window === 'undefined') return;

  try {
    console.log('🔧 Initializing client-side services...');
    // Initialize performance optimizations
    const { QueryOptimizationService } = await import('./services/queryOptimizationService');
    await QueryOptimizationService.initialize();
    console.log('✅ QueryOptimizationService initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize QueryOptimizationService:', error);
  }

  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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

// Main rendering function with enhanced error handling
const renderApp = () => {
  try {
    console.log('🎯 About to create root...');

    // Validate environment
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
    });

    // Create root and render app
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found in DOM');
    }

    console.log('🏗️ Creating React root...');
    const root = createRoot(rootElement);

    // Check if we should load debug mode
    const isDebugMode = window.location.search.includes('debug=true') ||
                       window.location.hash.includes('debug') ||
                       !process.env.REACT_APP_SUPABASE_URL ||
                       !process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (isDebugMode && !window.location.hash.includes('full-app')) {
      console.log('🧪 Rendering Debug App...');
      root.render(<DebugApp />);
      console.log('✅ Debug App rendered successfully!');
    } else {
      console.log('🎨 Attempting to render Full App component...');
      try {
        root.render(<App />);
        console.log('✅ Full App rendered successfully!');
      } catch (appError) {
        console.error('🔥 Failed to render App component:', appError);
        console.log('🧪 Falling back to Debug App...');
        root.render(<DebugApp />);
      }
    }
  } catch (error) {
    console.error('🔥 Critical error in main.tsx:', error);
    console.error('🔥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Enhanced fallback rendering with debugging info
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { message: 'Unknown error', details: String(error) };

      rootElement.innerHTML = `
        <div style="padding: 20px; background: linear-gradient(135deg, #dc2626, #991b1b); color: white; font-family: 'Segoe UI', Arial, sans-serif; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow-y: auto;">
          <div style="max-width: 800px; text-align: center;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">🔥 App Loading Error</h1>
            <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <h3>Error Details:</h3>
              <p><strong>Type:</strong> ${errorDetails.name || 'Unknown'}</p>
              <p><strong>Message:</strong> ${errorDetails.message}</p>
              <details style="margin-top: 10px;">
                <summary style="cursor: pointer;">Stack Trace</summary>
                <pre style="white-space: pre-wrap; font-size: 0.8rem; margin-top: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">${errorDetails.stack || 'No stack trace available'}</pre>
              </details>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button onclick="window.location.reload()" style="padding: 12px 24px; background: white; color: #dc2626; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                🔄 Reload Page
              </button>
              <button onclick="console.clear(); window.location.reload()" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 1px solid white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                🧹 Clear Console & Reload
              </button>
            </div>
            <p style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8;">
              Check the browser console (F12) for more detailed error information.
            </p>
          </div>
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

