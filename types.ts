
export interface NeedStatement {
  barrier: string;
  stakeholder: string;
  pain: string;
  workaround: string;
  need: string;
  statement: string;
}

export interface AIResponse {
  insights: {
    problemBrainstorm: string[];
    questions: string[];
    context: string;
    observationSummary: string;
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
