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
  allHelpers
} from './database-helpers';

// Re-export all helpers for backward compatibility
export const blueprintZoneHelpers = ideaForgeHelpers;
export const docsDecksHelpers = docsDecksHelpers;
export const ideaForgeHelpers = ideaForgeHelpers;
export const investorRadarHelpers = {
  // Investor-specific helpers
  async getInvestors() {
    return allHelpers.getInvestors();
  },
  async createInvestor(data: any) {
    return allHelpers.createInvestor(data);
  },
  async updateInvestor(id: string, data: any) {
    return allHelpers.updateInvestor(id, data);
  },
  async deleteInvestor(id: string) {
    return allHelpers.deleteInvestor(id);
  }
};

export const mvpStudioHelpers = mvpStudioHelpers;
export const pitchPerfectHelpers = {
  // Pitch Perfect specific helpers
  async getPitchScripts() {
    return allHelpers.getPitchScripts();
  },
  async createPitchScript(data: any) {
    return allHelpers.createPitchScript(data);
  },
  async getPitchDecks() {
    return allHelpers.getPitchDecks();
  },
  async createPitchDeck(data: any) {
    return allHelpers.createPitchDeck(data);
  },
  async getPitchVideos() {
    return allHelpers.getPitchVideos();
  },
  async createPitchVideo(data: any) {
    return allHelpers.createPitchVideo(data);
  }
};

export const taskPlannerHelpers = {
  // Task Planner specific helpers
  async getTasks(projectId?: string) {
    return allHelpers.getTasks(projectId);
  },
  async createTask(data: any) {
    return allHelpers.createTask(data);
  },
  async updateTask(id: string, data: any) {
    return allHelpers.updateTask(id, data);
  },
  async deleteTask(id: string) {
    return allHelpers.deleteTask(id);
  },
  async getProjects() {
    return allHelpers.getProjects();
  },
  async createProject(data: any) {
    return allHelpers.createProject(data);
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
