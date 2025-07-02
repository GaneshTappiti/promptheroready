import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize performance optimizations
import { QueryOptimizationService } from './services/queryOptimizationService'

console.log('main.tsx loading...');

// Initialize query optimization service
QueryOptimizationService.initialize().catch(console.error);

try {
  // Initialize dark mode before rendering
  document.documentElement.classList.add("dark");
  localStorage.setItem("theme", "dark");

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
      <div style="padding: 20px; background: red; color: white; font-family: Arial;">
        <h1>Error Loading App</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Check the console for more details.</p>
      </div>
    `;
  }
}

