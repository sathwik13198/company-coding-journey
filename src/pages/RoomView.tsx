import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, User as UserIcon, Users, Copy, Check, ArrowLeft, Sparkles } from "lucide-react";
import { useRoomChat } from "@/hooks/useRoomChat";
import { useRoomProgress } from "@/hooks/useRoomProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function RoomView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, loading: chatLoading, isAiLoading, sendMessage } = useRoomChat(id);
  const { participants, loading: progLoading } = useRoomProgress(id);
  
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const copyRoomId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  const renderContent = (content: string) => {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-headings:text-orange-400">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              if (className === "language-json_recommendations") {
                try {
                  const recommendations = JSON.parse(String(children));
                  return (
                    <div className="grid grid-cols-1 gap-2 mt-2 not-prose w-full">
                      {recommendations.map((rec: any, i: number) => (
                        <a
                          key={i}
                          href={rec.link || rec.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-background/80 p-3 rounded-xl border hover:border-orange-500/40 hover:bg-orange-500/5 transition-colors cursor-pointer no-underline"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-foreground">{rec.title}</span>
                            <div className="flex gap-2 text-xs items-center">
                              {rec.company && <span className="text-muted-foreground border px-2 py-0.5 rounded-full">{rec.company}</span>}
                              <span className={`font-medium ${rec.difficulty === 'Hard' ? 'text-red-500' : rec.difficulty === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                {rec.difficulty}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  );
                } catch (e) {
                  return <code>{children}</code>;
                }
              }
              return <code className={className} {...props}>{children}</code>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  if (chatLoading || progLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          <p className="text-sm text-muted-foreground">Loading room…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in max-w-[1400px] mx-auto w-full px-4 pt-4">
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* ─── LEFT PANEL: Party Progress ─────────────────── */}
        <div className="w-[300px] shrink-0 border border-border/40 rounded-3xl overflow-hidden flex flex-col hidden lg:flex shadow-sm"
             style={{ background: 'rgba(255,107,53,0.02)' }}>
          {/* Header */}
          <div className="p-4 border-b border-border/40 flex justify-between items-center"
               style={{ background: 'rgba(255,107,53,0.04)' }}>
            <h2 className="font-bold text-sm flex items-center gap-2">
              <span className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,107,53,0.15)' }}>
                <Users className="h-3.5 w-3.5 text-orange-400" />
              </span>
              Party Progress
            </h2>
            <button
              onClick={copyRoomId}
              className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-xl border transition-all"
              style={{
                background: copied ? 'rgba(0,200,180,0.1)' : 'rgba(255,255,255,0.04)',
                borderColor: copied ? 'rgba(0,200,180,0.3)' : 'rgba(255,255,255,0.08)',
                color: copied ? '#00C8B4' : 'rgba(255,255,255,0.4)',
              }}
              title="Click to copy Room ID"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : `#${id?.slice(0, 8)}`}
            </button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {participants.map((p, idx) => {
                const totalSolved = p.progress_data ? Object.keys(p.progress_data).length : 0;
                const initials = p.display_name?.slice(0, 2).toUpperCase() || "U";
                const colors = [
                  { bg: 'rgba(255,107,53,0.15)', text: '#FF6B35', ring: 'rgba(255,107,53,0.3)' },
                  { bg: 'rgba(0,200,180,0.15)',  text: '#00C8B4', ring: 'rgba(0,200,180,0.3)'  },
                  { bg: 'rgba(251,191,36,0.15)', text: '#F59E0B', ring: 'rgba(251,191,36,0.3)' },
                  { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6', ring: 'rgba(139,92,246,0.3)' },
                ];
                const c = colors[idx % colors.length];
                return (
                  <div key={p.user_id}
                       className="flex items-center gap-3 p-3 rounded-2xl border border-transparent hover:border-border/50 transition-all"
                       style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div
                      className="h-9 w-9 rounded-2xl flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden"
                      style={{ background: c.bg, color: c.text, boxShadow: `0 0 0 1.5px ${c.ring}` }}
                    >
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] truncate">{p.display_name || "Anonymous"}</div>
                      <div className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span className="font-medium" style={{ color: c.text }}>{totalSolved}</span>
                        <span>solved</span>
                      </div>
                    </div>
                    {/* Leaderboard mini-bar */}
                    <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                           style={{
                             width: `${Math.min((totalSolved / 10) * 100, 100)}%`,
                             background: c.text,
                             opacity: 0.7,
                           }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* ─── RIGHT PANEL: Chat ───────────────────────────── */}
        <div className="flex-1 border border-border/40 rounded-3xl overflow-hidden shadow-xl flex flex-col relative"
             style={{ background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(20px)' }}>
          {/* Chat header */}
          <div className="p-4 border-b border-border/40 flex items-center gap-3 shrink-0"
               style={{ background: 'rgba(255,255,255,0.02)' }}>
            <button
              onClick={() => navigate('/rooms')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:border-orange-500/30 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span className="text-border/60">|</span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400 opacity-70" />
              <h2 className="font-semibold text-sm">
                Collab Chat
                <span className="ml-2 text-muted-foreground/50 font-normal text-xs">· tag @mentor for AI help</span>
              </h2>
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-5 max-w-4xl mx-auto pb-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="h-16 w-16 rounded-3xl flex items-center justify-center mb-2"
                       style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>
                    <Users className="h-7 w-7 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Say hello to the room!</h3>
                  <p className="text-sm text-muted-foreground">Type <span className="font-mono text-orange-400">@mentor</span> to summon your AI guide.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="flex gap-3 max-w-[88%] mr-auto">
                    {/* Avatar */}
                    <div
                      className="shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center shadow-sm text-sm font-bold"
                      style={msg.is_ai ? {
                        background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,150,80,0.1))',
                        border: '1px solid rgba(255,107,53,0.3)',
                        color: '#FF6B35',
                      } : {
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {msg.is_ai ? <Bot className="h-4 w-4" /> : (
                        msg.avatar_url
                          ? <img src={msg.avatar_url} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                          : <UserIcon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold flex items-center gap-2 px-1"
                           style={{ color: msg.is_ai ? '#FF6B35' : 'rgba(255,255,255,0.45)' }}>
                        {msg.is_ai ? "✦ AI Mentor" : (msg.display_name || `User #${msg.user_id.slice(0, 6)}`)}
                        <span className="font-normal opacity-50">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className="py-3 px-4 rounded-[20px] rounded-tl-md shadow-sm"
                        style={{
                          background: msg.is_ai
                            ? 'rgba(255,107,53,0.05)'
                            : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${msg.is_ai ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        {msg.is_ai ? (
                          <div className="text-[14px] space-y-2">{renderContent(msg.content)}</div>
                        ) : (
                          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isAiLoading && (
                <div className="flex gap-3 max-w-[88%] mr-auto">
                  <div className="shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,150,80,0.1))', border: '1px solid rgba(255,107,53,0.3)', color: '#FF6B35' }}>
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="py-3 px-5 rounded-[20px] rounded-tl-md flex items-center gap-3"
                       style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                    <span className="text-[14px] text-muted-foreground font-medium animate-pulse">Mentor is thinking…</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input bar */}
          <div className="p-4 shrink-0 border-t border-border/30"
               style={{ background: 'rgba(0,0,0,0.2)' }}>
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto w-full relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Message room or tag @mentor…"
                disabled={isAiLoading}
                className="flex-1 pr-14 rounded-full h-13 text-[14px] transition-all duration-300 border"
                style={{
                  height: '50px',
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: inputFocused ? 'rgba(255,107,53,0.45)' : 'rgba(255,255,255,0.08)',
                  boxShadow: inputFocused ? '0 0 0 3px rgba(255,107,53,0.12)' : 'none',
                }}
              />
              <Button
                type="submit"
                disabled={isAiLoading || !input.trim()}
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-white shadow-md transition-all duration-200 active:scale-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E84A1D)' }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
