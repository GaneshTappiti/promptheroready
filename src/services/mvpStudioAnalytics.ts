/**
 * MVP Studio Analytics & Performance Monitoring
 * Tracks AI performance and user interactions to optimize the system
 */

export interface AnalyticsEvent {
  eventType: 'framework_generation' | 'page_prompt_generation' | 'tool_recommendation' | 'export_action' | 'user_interaction';
  timestamp: number;
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
  performance?: PerformanceMetrics;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorMessage?: string;
  aiModelUsed?: string;
  promptLength?: number;
  responseLength?: number;
}

export interface UserFeedback {
  eventId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  improvements?: string[];
  timestamp: number;
}

export interface SystemHealth {
  totalEvents: number;
  successRate: number;
  averageResponseTime: number;
  popularAppTypes: Record<string, number>;
  popularBuilderTools: Record<string, number>;
  userSatisfactionScore: number;
  commonErrors: Record<string, number>;
}

class MVPStudioAnalytics {
  private events: AnalyticsEvent[] = [];
  private feedback: UserFeedback[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  /**
   * Track framework generation performance
   */
  trackFrameworkGeneration(
    appType: string,
    complexity: string,
    startTime: number,
    success: boolean,
    errorMessage?: string
  ): string {
    const eventId = this.generateEventId();
    const endTime = Date.now();
    
    const event: AnalyticsEvent = {
      eventType: 'framework_generation',
      timestamp: startTime,
      sessionId: this.sessionId,
      data: {
        eventId,
        appType,
        complexity,
        success,
        errorMessage
      },
      performance: {
        startTime,
        endTime,
        duration: endTime - startTime,
        success,
        errorMessage
      }
    };

    this.events.push(event);
    this.logEvent(event);
    return eventId;
  }

  /**
   * Track page prompt generation
   */
  trackPagePromptGeneration(
    pageName: string,
    builderTool: string,
    promptLength: number,
    success: boolean
  ): string {
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    
    const event: AnalyticsEvent = {
      eventType: 'page_prompt_generation',
      timestamp,
      sessionId: this.sessionId,
      data: {
        eventId,
        pageName,
        builderTool,
        promptLength,
        success
      }
    };

    this.events.push(event);
    this.logEvent(event);
    return eventId;
  }

  /**
   * Track tool recommendations
   */
  trackToolRecommendation(
    appType: string,
    recommendedTools: string[],
    selectedTool?: string
  ): string {
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    
    const event: AnalyticsEvent = {
      eventType: 'tool_recommendation',
      timestamp,
      sessionId: this.sessionId,
      data: {
        eventId,
        appType,
        recommendedTools,
        selectedTool,
        recommendationCount: recommendedTools.length
      }
    };

    this.events.push(event);
    this.logEvent(event);
    return eventId;
  }

  /**
   * Track export actions
   */
  trackExportAction(
    exportFormat: string,
    builderTool: string,
    promptCount: number
  ): string {
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    
    const event: AnalyticsEvent = {
      eventType: 'export_action',
      timestamp,
      sessionId: this.sessionId,
      data: {
        eventId,
        exportFormat,
        builderTool,
        promptCount
      }
    };

    this.events.push(event);
    this.logEvent(event);
    return eventId;
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(
    action: string,
    component: string,
    additionalData?: Record<string, any>
  ): string {
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    
    const event: AnalyticsEvent = {
      eventType: 'user_interaction',
      timestamp,
      sessionId: this.sessionId,
      data: {
        eventId,
        action,
        component,
        ...additionalData
      }
    };

    this.events.push(event);
    return eventId;
  }

  /**
   * Collect user feedback
   */
  collectFeedback(
    eventId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback?: string,
    improvements?: string[]
  ): void {
    const userFeedback: UserFeedback = {
      eventId,
      rating,
      feedback,
      improvements,
      timestamp: Date.now()
    };

    this.feedback.push(userFeedback);
    this.logFeedback(userFeedback);
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): SystemHealth {
    const totalEvents = this.events.length;
    const successfulEvents = this.events.filter(e => e.performance?.success !== false).length;
    const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;

    const responseTimes = this.events
      .filter(e => e.performance?.duration)
      .map(e => e.performance!.duration);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const appTypes: Record<string, number> = {};
    const builderTools: Record<string, number> = {};
    const errors: Record<string, number> = {};

    this.events.forEach(event => {
      if (event.data.appType) {
        appTypes[event.data.appType] = (appTypes[event.data.appType] || 0) + 1;
      }
      if (event.data.builderTool) {
        builderTools[event.data.builderTool] = (builderTools[event.data.builderTool] || 0) + 1;
      }
      if (event.performance?.errorMessage) {
        errors[event.performance.errorMessage] = (errors[event.performance.errorMessage] || 0) + 1;
      }
    });

    const ratings = this.feedback.map(f => f.rating);
    const userSatisfactionScore = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 20 // Convert to 0-100 scale
      : 0;

    return {
      totalEvents,
      successRate,
      averageResponseTime,
      popularAppTypes: appTypes,
      popularBuilderTools: builderTools,
      userSatisfactionScore,
      commonErrors: errors
    };
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): {
    slowestOperations: Array<{ operation: string; averageTime: number }>;
    errorPatterns: Array<{ error: string; frequency: number }>;
    userSatisfactionTrends: Array<{ period: string; score: number }>;
    recommendations: string[];
  } {
    const operationTimes: Record<string, number[]> = {};
    
    this.events.forEach(event => {
      if (event.performance?.duration) {
        if (!operationTimes[event.eventType]) {
          operationTimes[event.eventType] = [];
        }
        operationTimes[event.eventType].push(event.performance.duration);
      }
    });

    const slowestOperations = Object.entries(operationTimes)
      .map(([operation, times]) => ({
        operation,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime);

    const errorCounts: Record<string, number> = {};
    this.events.forEach(event => {
      if (event.performance?.errorMessage) {
        errorCounts[event.performance.errorMessage] = (errorCounts[event.performance.errorMessage] || 0) + 1;
      }
    });

    const errorPatterns = Object.entries(errorCounts)
      .map(([error, frequency]) => ({ error, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    const recommendations: string[] = [];
    
    if (slowestOperations[0]?.averageTime > 5000) {
      recommendations.push('Consider optimizing framework generation performance');
    }
    
    if (errorPatterns.length > 0) {
      recommendations.push('Address common error patterns to improve reliability');
    }
    
    const avgSatisfaction = this.feedback.reduce((sum, f) => sum + f.rating, 0) / this.feedback.length;
    if (avgSatisfaction < 4) {
      recommendations.push('Focus on improving user experience based on feedback');
    }

    return {
      slowestOperations,
      errorPatterns,
      userSatisfactionTrends: [], // Could be implemented with time-based grouping
      recommendations
    };
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): {
    events: AnalyticsEvent[];
    feedback: UserFeedback[];
    health: SystemHealth;
    insights: ReturnType<MVPStudioAnalytics['getPerformanceInsights']>;
  } {
    return {
      events: this.events,
      feedback: this.feedback,
      health: this.getSystemHealth(),
      insights: this.getPerformanceInsights()
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    // Initialize analytics system
    console.log('MVP Studio Analytics initialized');
  }

  private logEvent(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }

  private logFeedback(feedback: UserFeedback): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('💬 User Feedback:', feedback);
    }
  }
}

// Singleton instance
export const mvpStudioAnalytics = new MVPStudioAnalytics();

// Helper hooks for React components
export const useAnalytics = () => {
  return {
    trackFrameworkGeneration: mvpStudioAnalytics.trackFrameworkGeneration.bind(mvpStudioAnalytics),
    trackPagePromptGeneration: mvpStudioAnalytics.trackPagePromptGeneration.bind(mvpStudioAnalytics),
    trackToolRecommendation: mvpStudioAnalytics.trackToolRecommendation.bind(mvpStudioAnalytics),
    trackExportAction: mvpStudioAnalytics.trackExportAction.bind(mvpStudioAnalytics),
    trackUserInteraction: mvpStudioAnalytics.trackUserInteraction.bind(mvpStudioAnalytics),
    collectFeedback: mvpStudioAnalytics.collectFeedback.bind(mvpStudioAnalytics),
    getSystemHealth: mvpStudioAnalytics.getSystemHealth.bind(mvpStudioAnalytics),
    getPerformanceInsights: mvpStudioAnalytics.getPerformanceInsights.bind(mvpStudioAnalytics)
  };
};
