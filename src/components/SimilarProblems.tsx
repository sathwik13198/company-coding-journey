import { useEffect, useState } from "react";
import { SimilarProblem, SimilarProblemsResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Sparkles } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

interface SimilarProblemsProps {
  problemSlug: string;
}

export function SimilarProblems({ problemSlug }: SimilarProblemsProps) {
  const [data, setData] = useState<SimilarProblem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`https://leetcode-api-pied.vercel.app/problem/${problemSlug}/similar`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json: SimilarProblemsResponse = await res.json();
        setData(json.similar);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [problemSlug]);

  if (loading) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-2">
        {error ? "Failed to load similar problems." : "No similar problems found."}
      </div>
    );
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "bg-easy/15 text-easy border-easy/30 hover:bg-easy/25";
      case "Medium": return "bg-medium/15 text-medium border-medium/30 hover:bg-medium/25";
      case "Hard": return "bg-hard/15 text-hard border-hard/30 hover:bg-hard/25";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 py-3">
      {data.map((p) => (
        <a
          key={p.title_slug}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="h-3 w-3 text-yellow-500 shrink-0" />
            <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {p.title}
            </span>
          </div>
          <Badge className={`ml-2 text-[10px] px-1.5 py-0 h-5 ${getDifficultyColor(p.difficulty)}`}>
            {p.difficulty}
          </Badge>
        </a>
      ))}
    </div>
  );
}
