export interface AlternativePhrase {
  phrase: string;
  nuance: string;
}

export interface Evaluation {
  npc_reaction: string;
  score: number;
  explanation: string;
  alternative_phrases: AlternativePhrase[];
  cultural_note: string;
}

export interface Scenario {
  npc_role: string;
  npc_dialogue: string;
  description: string;
  target_sentence: string;
}

export interface GameResponse {
  evaluation: Evaluation | null;
  next_scenario: Scenario;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
