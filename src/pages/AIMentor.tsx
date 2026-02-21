import { useState, useRef, useEffect } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { QuestionCard, QuestionRecommendation } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Sparkles, Trash2, Loader2, Plus, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIMentor() {
  const { 
    sessions, 
    activeSessionId, 
    activeMessages, 
    setActiveSessionId, 
    createNewSession, 
    deleteSession, 
    loading, 
    sendMessage, 
    clearHistory 
  } = useAIChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```json_recommendations[\s\S]*?```)/);
    
    return parts.map((part, index) => {
      if (part.startsWith("\`\`\`json_recommendations")) {
        try {
          const jsonStr = part.replace(/\`\`\`json_recommendations/, "").replace(/\`\`\`/, "").trim();
          const questions: QuestionRecommendation[] = JSON.parse(jsonStr);
          return (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {questions.map((q, idx) => (
                <QuestionCard key={idx} question={q} />
              ))}
            </div>
          );
        } catch (e) {
          console.error("Failed to parse recommendations", e);
          // Fallback to normal rendering if JSON is malformed
          return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>;
        }
      }
      return (
        <div key={index} className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-indigo-700 dark:prose-headings:text-indigo-300 prose-p:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {part}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in relative max-w-7xl mx-auto w-full px-4">
      <div className="flex items-center justify-between mb-4 shrink-0 px-2 mt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-500" />
            AI Mentor
          </h1>
          <p className="text-muted-foreground mt-1">Get personalized guidance and practice questions</p>
        </div>
        <div className="flex gap-2">
          {activeMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive transition-colors rounded-full px-4 border-muted">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Current Chat
            </Button>
          )}
          <Button size="sm" onClick={createNewSession} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* MAIN CHAT AREA (LEFT) */}
        <div className="flex-1 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl overflow-hidden flex flex-col shadow-xl ring-1 ring-border/20">
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-6 pb-4 max-w-4xl mx-auto">
              {activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-20 w-20 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2rem] flex items-center justify-center mb-2 shadow-inner ring-1 ring-indigo-500/20">
                    <Bot className="h-10 w-10 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Welcome to your AI Mentor!</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mt-3 leading-relaxed">
                      Ask me for coding strategies, concept explanations, or specific question recommendations like "Give me 3 medium array questions for Amazon".
                    </p>
                  </div>
                </div>
              ) : (
                activeMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 max-w-[85%] ${
                      message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div className={`shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm ${
                      message.role === "user" 
                        ? "bg-indigo-600 text-white" 
                        : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 border border-indigo-500/20"
                    }`}>
                      {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    
                    <div className={`space-y-1.5 ${message.role === "user" ? "items-end text-right" : ""}`}>
                      <div className={`py-3 px-5 ${
                        message.role === "user" 
                          ? "bg-indigo-600 text-white rounded-[24px] rounded-tr-md inline-block text-left shadow-md" 
                          : "bg-card/60 backdrop-blur-sm border border-border/50 rounded-[24px] rounded-tl-md w-full shadow-sm"
                      }`}>
                        {message.role === "user" ? (
                          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="text-[15px] space-y-2">
                            {renderContent(message.content)}
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground/60 px-2 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex gap-4 max-w-[85%] mr-auto">
                  <div className="shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-[24px] rounded-tl-md py-4 px-5 flex items-center gap-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span className="text-[15px] text-muted-foreground font-medium animate-pulse">Mentor is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-background/40 backdrop-blur-xl border-t border-border/40 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto w-full relative group">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for interview advice or question recommendations..."
                disabled={loading}
                className="flex-1 bg-card/60 border-border/50 focus-visible:ring-indigo-500 focus-visible:ring-2 pr-14 rounded-full h-14 shadow-sm text-[15px] transition-all group-hover:border-indigo-500/30"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()} 
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 hover:shadow-indigo-500/25"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="text-center mt-3">
               <span className="text-xs text-muted-foreground/50 font-medium tracking-wide">AI Mentor can make mistakes. Verify important technical details.</span>
            </div>
          </div>
        </div>

        {/* CHAT SESSIONS SIDEBAR (RIGHT) */}
        <div className="w-[300px] shrink-0 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl overflow-hidden flex flex-col shadow-xl ring-1 ring-border/20 hidden lg:flex">
          <div className="p-4 border-b border-border/40 bg-background/20">
            <h2 className="font-semibold px-2 text-sm tracking-wide text-muted-foreground uppercase">Previous Chats</h2>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    activeSessionId === session.id
                      ? "bg-indigo-500/10 text-indigo-500 font-medium"
                      : "hover:bg-accent/50 text-muted-foreground"
                  }`}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`h-4 w-4 shrink-0 ${activeSessionId === session.id ? "text-indigo-500" : "text-muted-foreground/60"}`} />
                    <div className="truncate text-sm">
                      {session.title || "New Chat"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
