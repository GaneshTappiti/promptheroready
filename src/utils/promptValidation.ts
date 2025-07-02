/**
 * Prompt Validation Utilities
 * Tools for analyzing and improving AI prompts based on best practices
 */

export interface PromptAnalysis {
  score: number;
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  hasPersona: boolean;
  hasTask: boolean;
  hasContext: boolean;
  hasFormat: boolean;
  wordCount: number;
  characterCount: number;
  suggestions: string[];
}

export interface PromptComponents {
  persona?: string;
  task?: string;
  context?: string;
  format?: string;
}

/**
 * Analyzes a prompt and provides quality assessment
 */
export function analyzePrompt(prompt: string): PromptAnalysis {
  const wordCount = prompt.trim().split(/\s+/).length;
  const characterCount = prompt.length;
  
  // Check for key components
  const hasPersona = checkForPersona(prompt);
  const hasTask = checkForTask(prompt);
  const hasContext = checkForContext(prompt);
  const hasFormat = checkForFormat(prompt);
  
  // Calculate score based on components present
  let score = 0;
  if (hasPersona) score += 25;
  if (hasTask) score += 25;
  if (hasContext) score += 25;
  if (hasFormat) score += 25;
  
  // Determine quality level
  let quality: PromptAnalysis['quality'];
  if (score >= 90) quality = 'Excellent';
  else if (score >= 70) quality = 'Good';
  else if (score >= 50) quality = 'Fair';
  else quality = 'Poor';
  
  // Generate suggestions
  const suggestions = generateSuggestions({
    hasPersona,
    hasTask,
    hasContext,
    hasFormat,
    wordCount,
    characterCount
  });
  
  return {
    score,
    quality,
    hasPersona,
    hasTask,
    hasContext,
    hasFormat,
    wordCount,
    characterCount,
    suggestions
  };
}

/**
 * Builds a structured prompt from components
 */
export function buildPrompt(components: PromptComponents): string {
  const { persona, task, context, format } = components;
  
  let prompt = '';
  
  if (persona) {
    prompt += persona.trim();
    if (!persona.endsWith('.')) prompt += '.';
    prompt += ' ';
  }
  
  if (task) {
    prompt += task.trim();
    if (!task.endsWith('.') && !task.endsWith(':')) prompt += ' ';
  }
  
  if (context) {
    prompt += context.trim();
    if (!context.endsWith('.')) prompt += '.';
    prompt += ' ';
  }
  
  if (format) {
    prompt += format.trim();
    if (!format.endsWith('.')) prompt += '.';
  }
  
  return prompt.trim();
}

/**
 * Suggests improvements for a prompt
 */
export function improvePrompt(prompt: string): string[] {
  const analysis = analyzePrompt(prompt);
  const improvements: string[] = [];
  
  if (!analysis.hasPersona) {
    improvements.push("Add a persona: Start with 'I am a [role]' to provide context about your perspective.");
  }
  
  if (!analysis.hasTask) {
    improvements.push("Clarify the task: Be specific about what you want the AI to do (analyze, create, explain, etc.).");
  }
  
  if (!analysis.hasContext) {
    improvements.push("Provide context: Include relevant background information, constraints, or specific details.");
  }
  
  if (!analysis.hasFormat) {
    improvements.push("Specify format: Tell the AI how you want the response structured (list, table, paragraph, etc.).");
  }
  
  if (analysis.wordCount < 10) {
    improvements.push("Add more detail: Your prompt is quite short. Consider adding more specific requirements.");
  }
  
  if (analysis.wordCount > 200) {
    improvements.push("Consider shortening: Very long prompts can be confusing. Focus on essential details.");
  }
  
  return improvements;
}

/**
 * Check if prompt contains persona information
 */
function checkForPersona(prompt: string): boolean {
  const personaIndicators = [
    'I am',
    'As a',
    'I\'m a',
    'My role is',
    'I work as',
    'I am working as',
    'As an'
  ];
  
  return personaIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Check if prompt contains clear task instructions
 */
function checkForTask(prompt: string): boolean {
  const taskVerbs = [
    'analyze', 'create', 'write', 'generate', 'develop', 'design',
    'build', 'plan', 'research', 'compare', 'evaluate', 'assess',
    'summarize', 'explain', 'describe', 'outline', 'list', 'identify',
    'recommend', 'suggest', 'propose', 'calculate', 'estimate'
  ];
  
  return taskVerbs.some(verb => 
    prompt.toLowerCase().includes(verb.toLowerCase())
  );
}

/**
 * Check if prompt provides sufficient context
 */
function checkForContext(prompt: string): boolean {
  const contextIndicators = [
    'for a', 'targeting', 'in the', 'with a budget', 'within',
    'considering', 'given that', 'assuming', 'based on',
    'taking into account', 'for the purpose of', 'in order to'
  ];
  
  // Also check for specific details like numbers, dates, or industry terms
  const hasSpecificDetails = /\d+|\$|%|industry|market|company|business|startup/.test(prompt.toLowerCase());
  
  return contextIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator.toLowerCase())
  ) || hasSpecificDetails;
}

/**
 * Check if prompt specifies desired format
 */
function checkForFormat(prompt: string): boolean {
  const formatIndicators = [
    'format as', 'present as', 'structure as', 'organize as',
    'in the form of', 'as a list', 'as a table', 'in bullet points',
    'in paragraphs', 'as a report', 'as an outline', 'step by step',
    'numbered list', 'bulleted list', 'in sections', 'with headings'
  ];
  
  return formatIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Generate specific suggestions based on analysis
 */
function generateSuggestions(analysis: {
  hasPersona: boolean;
  hasTask: boolean;
  hasContext: boolean;
  hasFormat: boolean;
  wordCount: number;
  characterCount: number;
}): string[] {
  const suggestions: string[] = [];
  
  if (!analysis.hasPersona) {
    suggestions.push("Add your role or perspective (e.g., 'I am a startup founder...')");
  }
  
  if (!analysis.hasTask) {
    suggestions.push("Use specific action verbs (analyze, create, develop, etc.)");
  }
  
  if (!analysis.hasContext) {
    suggestions.push("Include relevant details like industry, target audience, or constraints");
  }
  
  if (!analysis.hasFormat) {
    suggestions.push("Specify how you want the response formatted (list, table, report, etc.)");
  }
  
  if (analysis.wordCount < 15) {
    suggestions.push("Consider adding more specific requirements and details");
  }
  
  if (analysis.wordCount > 150) {
    suggestions.push("Try to be more concise while keeping essential details");
  }
  
  return suggestions;
}

/**
 * Common prompt templates for startup use cases
 */
export const promptTemplates = {
  marketResearch: {
    persona: "I am a startup founder in the early validation stage",
    task: "Conduct comprehensive market research",
    context: "for a [product/service] targeting [customer segment] in the [industry] market",
    format: "Present findings as a structured report with market size, trends, competitors, and opportunities"
  },
  
  competitiveAnalysis: {
    persona: "I am an entrepreneur launching a new product",
    task: "Analyze the competitive landscape",
    context: "for [product description] competing against [list competitors] in [market segment]",
    format: "Create a comparison table with features, pricing, strengths, weaknesses, and positioning"
  },
  
  businessPlan: {
    persona: "I am a first-time entrepreneur seeking investment",
    task: "Write a comprehensive business plan",
    context: "for a [business type] targeting [customer segment] with [value proposition]",
    format: "Structure as executive summary, market analysis, business model, financials, and timeline"
  },
  
  mvpPlanning: {
    persona: "I am a technical founder building a software product",
    task: "Define the minimum viable product scope",
    context: "for [product description] serving [target users] with [budget] and [timeline]",
    format: "Prioritize features in a roadmap with effort estimates and success criteria"
  },
  
  fundraising: {
    persona: "I am a startup founder seeking Series A funding",
    task: "Develop a fundraising strategy",
    context: "for a [business description] with [traction metrics] targeting [investor type]",
    format: "Create an action plan with investor targets, timeline, and pitch requirements"
  }
};
