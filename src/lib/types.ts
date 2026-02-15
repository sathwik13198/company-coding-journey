export interface Problem {
  slug: string;
  title: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  topics: string;
}

export interface Company {
  name: string;
  slug: string;
  problem_count: number;
  problems: Problem[];
}

export interface CompanyData {
  [key: string]: Company;
}

export interface ProblemNote {
  intuition: string;
  code: string;
  updatedAt: number;
}

export interface UserProgress {
  solved: Record<string, boolean>; // "companySlug::problemSlug" -> true
  notes: Record<string, ProblemNote>; // "companySlug::problemSlug" -> note
  lastActive: Record<string, number>; // companySlug -> timestamp
  streak: number;
  lastSolvedDate: string; // YYYY-MM-DD
}

export const DEFAULT_PROGRESS: UserProgress = {
  solved: {},
  notes: {},
  lastActive: {},
  streak: 0,
  lastSolvedDate: "",
};

export interface SimilarProblem {
  title: string;
  title_slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
}

export interface SimilarProblemsResponse {
  problem: string;
  similar: SimilarProblem[];
}
