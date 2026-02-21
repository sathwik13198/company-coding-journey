import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Flame } from "lucide-react";

export interface QuestionRecommendation {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  link: string;
  company?: string;
}

interface QuestionCardProps {
  question: QuestionRecommendation;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const getBadgeVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "secondary";
      case "medium":
        return "default";
      case "hard":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getBadgeClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-easy/10 text-easy hover:bg-easy/20 border-easy/20";
      case "medium":
        return "bg-medium/10 text-medium hover:bg-medium/20 border-medium/20";
      case "hard":
        return "bg-hard/10 text-hard hover:bg-hard/20 border-hard/20";
      default:
        return "";
    }
  };

  return (
    <a href={question.link} target="_blank" rel="noopener noreferrer" className="block max-w-sm mt-3 mb-3">
      <Card className="hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur border-border/50 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 relative">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight mb-2">
                {question.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getBadgeVariant(question.difficulty)} 
                  className={`text-[10px] px-2 py-0 h-4 uppercase tracking-wider ${getBadgeClass(question.difficulty)}`}
                >
                  {question.difficulty}
                </Badge>
                {question.company && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0 h-4 uppercase tracking-wider text-muted-foreground border-border/50">
                    {question.company}
                  </Badge>
                )}
              </div>
            </div>
            <div className="shrink-0 pt-0.5 text-muted-foreground group-hover:text-primary transition-colors bg-accent/50 p-1.5 rounded-full">
               <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
