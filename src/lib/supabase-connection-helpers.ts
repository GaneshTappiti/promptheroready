// =====================================================
// SUPABASE CONNECTION HELPERS
// =====================================================
// This file provides connection helpers for different modules
// Re-exports from database-helpers for backward compatibility

import {
  workspaceHelpers,
  ideaVaultHelpers,
  ideaForgeHelpers,
  mvpStudioHelpers,
  teamSpaceHelpers,
  docsDecksHelpers,
  onboardingHelpers,
  profileHelpers,
  adminHelpers,
  subscriptionHelpers,
  blueprintZoneHelpers as blueprintZoneHelpersOriginal,
  allHelpers
} from './database-helpers';

// Re-export all helpers for backward compatibility
export const blueprintZoneHelpers = blueprintZoneHelpersOriginal;
export { docsDecksHelpers };
export { ideaForgeHelpers };
export const investorRadarHelpers = {
  // Investor-specific helpers
  async getInvestors(userId: string, filters?: any) {
    return allHelpers.investorRadar.getInvestors(userId, filters);
  },
  async createInvestor(data: any) {
    return allHelpers.investorRadar.createInvestor(data);
  },
  async updateInvestor(id: string, data: any) {
    return allHelpers.investorRadar.updateInvestor(id, data);
  },
  async deleteInvestor(id: string) {
    return allHelpers.investorRadar.deleteInvestor(id);
  },
  async getFundingRounds(userId: string) {
    return allHelpers.investorRadar.getFundingRounds(userId);
  }
};

export { mvpStudioHelpers };
export const pitchPerfectHelpers = {
  // Pitch Perfect specific helpers
  async getPitchScripts(userId: string, scriptType?: string) {
    return allHelpers.pitchPerfect.getPitchScripts(userId, scriptType);
  },
  async createPitchScript(data: any) {
    return allHelpers.pitchPerfect.createPitchScript(data);
  },
  async getPitchDecks(userId: string, deckType?: string) {
    return allHelpers.pitchPerfect.getPitchDecks(userId, deckType);
  },
  async createPitchDeck(data: any) {
    return allHelpers.pitchPerfect.createPitchDeck(data);
  },
  async getPitchVideos(userId: string, videoType?: string) {
    return allHelpers.pitchPerfect.getPitchVideos(userId, videoType);
  },
  async createPitchVideo(data: any) {
    return allHelpers.pitchPerfect.createPitchVideo(data);
  }
};

export const taskPlannerHelpers = {
  // Task Planner specific helpers
  async getTasks(userId: string, filters?: { status?: string; priority?: string; projectId?: string }) {
    return allHelpers.taskPlanner.getTasks(userId, filters);
  },
  async createTask(data: any) {
    return allHelpers.taskPlanner.createTask(data);
  },
  async updateTask(id: string, data: any) {
    return allHelpers.taskPlanner.updateTask(id, data);
  },
  async deleteTask(id: string) {
    return allHelpers.taskPlanner.deleteTask(id);
  },
  async getProjects(userId: string) {
    return allHelpers.taskPlanner.getProjects(userId);
  },
  async createProject(data: any) {
    return allHelpers.taskPlanner.createProject(data);
  }
};

// Export all helpers as a single object for convenience
export const connectionHelpers = {
  blueprintZone: blueprintZoneHelpers,
  docsDecks: docsDecksHelpers,
  ideaForge: ideaForgeHelpers,
  investorRadar: investorRadarHelpers,
  mvpStudio: mvpStudioHelpers,
  pitchPerfect: pitchPerfectHelpers,
  taskPlanner: taskPlannerHelpers,
  workspace: workspaceHelpers,
  ideaVault: ideaVaultHelpers,
  teamSpace: teamSpaceHelpers,
  onboarding: onboardingHelpers,
  profile: profileHelpers,
  admin: adminHelpers,
  subscription: subscriptionHelpers
};

export default connectionHelpers;
