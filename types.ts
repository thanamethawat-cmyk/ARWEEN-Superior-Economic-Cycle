export enum ModelType {
  Thinking = 'gemini-3-pro-preview',
  Vision = 'gemini-3-pro-preview', // Using 3-pro for advanced video/image reasoning
  Fast = 'gemini-2.5-flash-lite-latest',
  Maps = 'gemini-2.5-flash'
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
