// Dark mode configuration
// This script sets up dark mode for the application

// Initialize dark mode - always dark
export const initializeDarkMode = () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
};

// Toggle dark mode - disabled since we always want dark
export const toggleDarkMode = () => {
  // No-op since we always want dark theme
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
};

// Apply dark mode immediately
initializeDarkMode();
