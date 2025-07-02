// AI Provider Integration Tests - End-to-end user flow testing
import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AISettingsPanel } from '@/components/ai-settings/AISettingsPanel';
import { AuthContext } from '@/contexts/AuthContext';
import { aiProviderService } from '@/services/aiProviderService';
import { getUserPreferences, saveUserPreferences } from '@/services/userAIPreferencesService';

// Mock dependencies
vi.mock('@/services/aiProviderService');
vi.mock('@/services/userAIPreferencesService');
vi.mock('@/hooks/use-toast');

const mockAiProviderService = aiProviderService as any;
const mockGetUserPreferences = getUserPreferences as Mock;
const mockSaveUserPreferences = saveUserPreferences as Mock;

// Mock user context
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  created_at: new Date().toISOString()
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn()
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('AI Provider Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockGetUserPreferences.mockResolvedValue({
      preferredProvider: 'openai',
      apiKeys: {
        openai: 'test-key-123'
      },
      settings: {
        temperature: 0.7,
        maxTokens: 1000
      }
    });

    mockSaveUserPreferences.mockResolvedValue(true);
    
    mockAiProviderService.validateApiKey.mockResolvedValue({ 
      isValid: true, 
      provider: 'openai' 
    });
    mockAiProviderService.testConnection.mockResolvedValue({ 
      success: true, 
      responseTime: 150 
    });
    mockAiProviderService.getProviderInfo.mockReturnValue({
      name: 'OpenAI',
      description: 'Advanced AI models from OpenAI',
      features: ['GPT-4', 'GPT-3.5', 'DALL-E'],
      pricing: 'Pay per token'
    });
  });

  describe('Initial Load and Setup', () => {
    it('should load user preferences on component mount', async () => {
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalledWith('test-user-123');
      });

      // Should display the loaded provider
      expect(screen.getByText(/openai/i)).toBeInTheDocument();
    });

    it('should handle missing user preferences gracefully', async () => {
      mockGetUserPreferences.mockResolvedValue(null);

      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/no ai provider configured/i)).toBeInTheDocument();
      });
    });
  });

  describe('Provider Configuration Flow', () => {
    it('should allow user to select and configure a new provider', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      // Click on provider selection
      const providerSelect = screen.getByRole('combobox');
      await user.click(providerSelect);

      // Select Gemini
      const geminiOption = screen.getByText(/gemini/i);
      await user.click(geminiOption);

      // Enter API key
      const apiKeyInput = screen.getByPlaceholderText(/enter.*api.*key/i);
      await user.type(apiKeyInput, 'test-gemini-key-456');

      // Save configuration
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockAiProviderService.validateApiKey).toHaveBeenCalledWith(
          'test-gemini-key-456',
          'gemini'
        );
      });

      await waitFor(() => {
        expect(mockSaveUserPreferences).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            preferredProvider: 'gemini',
            apiKeys: expect.objectContaining({
              gemini: 'test-gemini-key-456'
            })
          })
        );
      });
    });

    it('should validate API key before saving', async () => {
      mockAiProviderService.validateApiKey.mockResolvedValue({ 
        isValid: false, 
        error: 'Invalid API key format' 
      });

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      const apiKeyInput = screen.getByDisplayValue('test-key-123');
      await user.clear(apiKeyInput);
      await user.type(apiKeyInput, 'invalid-key');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid api key format/i)).toBeInTheDocument();
      });

      // Should not save invalid configuration
      expect(mockSaveUserPreferences).not.toHaveBeenCalled();
    });
  });

  describe('Connection Testing', () => {
    it('should test connection to AI provider', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      await waitFor(() => {
        expect(mockAiProviderService.testConnection).toHaveBeenCalledWith(
          'openai',
          'test-key-123'
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
        expect(screen.getByText(/150ms/)).toBeInTheDocument();
      });
    });

    it('should handle connection failures gracefully', async () => {
      mockAiProviderService.testConnection.mockResolvedValue({ 
        success: false, 
        error: 'Network timeout' 
      });

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
        expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
      });
    });
  });

  describe('Settings Management', () => {
    it('should allow user to adjust AI model settings', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      // Adjust temperature
      const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
      fireEvent.change(temperatureSlider, { target: { value: '0.9' } });

      // Adjust max tokens
      const maxTokensInput = screen.getByLabelText(/max tokens/i);
      await user.clear(maxTokensInput);
      await user.type(maxTokensInput, '2000');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSaveUserPreferences).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            settings: expect.objectContaining({
              temperature: 0.9,
              maxTokens: 2000
            })
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockGetUserPreferences.mockRejectedValue(new Error('Database connection failed'));

      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error loading preferences/i)).toBeInTheDocument();
      });
    });

    it('should handle save errors with user feedback', async () => {
      mockSaveUserPreferences.mockRejectedValue(new Error('Save failed'));

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Experience Flow', () => {
    it('should complete full setup flow for new user', async () => {
      // Simulate new user with no preferences
      mockGetUserPreferences.mockResolvedValue(null);

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      // Should show setup prompt
      await waitFor(() => {
        expect(screen.getByText(/get started/i)).toBeInTheDocument();
      });

      // Select provider
      const providerSelect = screen.getByRole('combobox');
      await user.click(providerSelect);
      
      const openaiOption = screen.getByText(/openai/i);
      await user.click(openaiOption);

      // Enter API key
      const apiKeyInput = screen.getByPlaceholderText(/enter.*api.*key/i);
      await user.type(apiKeyInput, 'sk-new-user-key-789');

      // Test connection
      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
      });

      // Save configuration
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSaveUserPreferences).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            preferredProvider: 'openai',
            apiKeys: expect.objectContaining({
              openai: 'sk-new-user-key-789'
            })
          })
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/configuration saved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Provider Information Display', () => {
    it('should display provider information and features', async () => {
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      // Should display provider info
      expect(screen.getByText(/advanced ai models from openai/i)).toBeInTheDocument();
      expect(screen.getByText(/gpt-4/i)).toBeInTheDocument();
      expect(screen.getByText(/pay per token/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      // Tab through form elements
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();

      await user.tab();
      expect(screen.getByDisplayValue('test-key-123')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /test connection/i })).toHaveFocus();
    });

    it('should have proper ARIA labels and descriptions', async () => {
      render(
        <TestWrapper>
          <AISettingsPanel />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetUserPreferences).toHaveBeenCalled();
      });

      // Check for proper labeling
      expect(screen.getByLabelText(/ai provider/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /temperature/i })).toBeInTheDocument();
    });
  });
});
