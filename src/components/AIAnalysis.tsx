import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Bot } from "lucide-react";
import { analyzeProblem } from "@/lib/gemini";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIAnalysisProps {
  title: string;
  difficulty: string;
  url: string;
}

export function AIAnalysis({ title, difficulty, url }: AIAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (analysis) return; // Already analyzed
    setLoading(true);
    try {
      const result = await analyzeProblem(title, difficulty, url);
      setAnalysis(result);
    } catch (error) {
      toast.error("Failed to generate analysis. Check your API key.");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-all shadow-sm"
          onClick={handleAnalyze}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-indigo-500/20">
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 border-b border-indigo-500/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-5 w-5" />
              AI Analysis
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <ScrollArea className="flex-1 p-6 h-[60vh]">
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground min-h-[300px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                  <Bot className="h-12 w-12 text-indigo-500 relative z-10 animate-bounce" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">Analyzing Problem...</p>
                  <p className="text-xs text-muted-foreground">Reading problem details • Identifying algorithms • Generating hints</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-indigo-700 dark:prose-headings:text-indigo-300 prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysis}
                </ReactMarkdown>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
