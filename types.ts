export enum ModelType {
  Thinking = 'gemini-2.0-flash-thinking-exp-01-21', // Use a stable thinking model
  Vision = 'gemini-2.0-flash', // 2.0 Flash has excellent vision capabilities
  Fast = 'gemini-2.0-flash', // Stable fast model
  Maps = 'gemini-2.0-flash'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  thinking?: boolean; // Is the model currently "thinking"
  groundingUrls?: string[]; // For Maps/Search results
}

export interface OptimizationResult {
  payloadEfficiency: string;
  carbonCredit: string;
  legalCompliance: string;
  recommendation: string;
}