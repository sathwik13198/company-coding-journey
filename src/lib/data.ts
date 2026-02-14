import rawData from "@/data/seed_data.json";
import { CompanyData, Company, Problem } from "./types";

export const companyData = rawData as CompanyData;

export const companyList: Company[] = Object.values(companyData).sort(
  (a, b) => b.problem_count - a.problem_count
);

export const totalProblems = companyList.reduce(
  (sum, c) => sum + c.problem_count,
  0
);

export function getCompany(slug: string): Company | undefined {
  return companyList.find((c) => c.slug === slug);
}

export function getDifficultyCount(
  problems: Problem[],
  difficulty: "easy" | "medium" | "hard"
) {
  return problems.filter((p) => p.difficulty === difficulty).length;
}

export function getAllTopics(problems: Problem[]): string[] {
  const topicSet = new Set<string>();
  problems.forEach((p) => {
    if (p.topics) {
      p.topics.split(", ").forEach((t) => {
        if (t.trim()) topicSet.add(t.trim());
      });
    }
  });
  return Array.from(topicSet).sort();
}
