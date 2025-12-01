export enum Pronoun {
  JE = "Je",
  TU = "Tu",
  IL_ELLE = "Il/Elle",
  NOUS = "Nous",
  VOUS = "Vous",
  ILS_ELLES = "Ils/Elles"
}

export enum Tense {
  PRESENT = "Present",
  FUTUR_SIMPLE = "Futur Simple",
  IMPARFAIT = "Imparfait",
  PASSE_COMPOSE = "Passé Composé",
  PLUS_QUE_PARFAIT = "Plus-que-parfait"
}

export interface ConjugationEntry {
  pronoun: Pronoun;
  conjugation: string;
  pronunciationKey?: string; // Phonetic hint
}

export interface VerbData {
  verb: string;
  tense: Tense;
  translation: string;
  emoji: string;
  conjugations: ConjugationEntry[];
  exampleSentence: string;
}

export interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  translation: string;
}

export interface StoryScenario {
  imagePrompt: string;
  targetSentence: string;
  hint: string; // e.g. "Use the pronoun 'Il'"
}

export const SUGGESTED_VERBS = [
  "manger",
  "être",
  "avoir",
  "aller",
  "faire",
  "jouer",
  "aimer",
  "finir",
  "pouvoir",
  "vouloir",
  "danser",
  "chanter",
  "dormir"
];