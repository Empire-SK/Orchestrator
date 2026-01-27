
export interface NeedStatement {
  statement: string;
  category: string;
  impactScore: number;
  marketPotential: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  feasibility: number;
  innovationScore: number;
  unfairAdvantage: string;
  timeToExecution: string;
}

export interface AIResponse {
  insights: {
    observation: string;
    context: string;
    keyInsights: string[];
    recommendations: string[];
  };
  tableData: NeedStatement[];
}

/**
 * Interface for the AI Studio key selection utility.
 * Fixed: Moved outside declare global so it can be exported correctly from the module.
 */
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    /**
     * The aistudio object provided by the environment.
     * Fixed: Added readonly modifier to match the existing global declaration and avoid modifier mismatch errors.
     */
    readonly aistudio: AIStudio;
  }
}
