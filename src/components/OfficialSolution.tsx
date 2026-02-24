import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Youtube,
  Github,
  ExternalLink,
  Code2,
  ChevronRight,
  Lock,
} from "lucide-react";

interface OfficialSolutionProps {
  titleSlug: string;
  title: string;
  difficulty: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "bg-easy/15 text-easy border-easy/30",
  medium: "bg-medium/15 text-medium border-medium/30",
  hard:   "bg-hard/15 text-hard border-hard/30",
};

interface Resource {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent: string;         // tailwind text-color class for icon/label
  bg: string;             // tailwind bg class for icon box
  border: string;         // tailwind border class for card
  badge?: string;         // optional badge text (e.g. "Free")
  badgeClass?: string;
}

function buildResources(slug: string, title: string): Resource[] {
  const encoded = encodeURIComponent(`leetcode ${title} solution`);

  return [
    {
      label: "NeetCode",
      description:
        "Free video walkthroughs and written solutions for hundreds of popular interview problems.",
      href: `https://neetcode.io/problems/${slug}`,
      icon: <Code2 className="h-4 w-4" />,
      accent: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20 hover:border-teal-500/50",
      badge: "Recommended",
      badgeClass: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    },
    {
      label: "YouTube",
      description:
        "Browse community video explanations and step-by-step coding walkthroughs.",
      href: `https://www.youtube.com/results?search_query=${encoded}`,
      icon: <Youtube className="h-4 w-4" />,
      accent: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20 hover:border-red-500/50",
      badge: "Free",
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    {
      label: "GitHub",
      description:
        "Search open-source solution repositories with multi-language implementations.",
      href: `https://github.com/search?q=leetcode+${encodeURIComponent(title)}&type=repositories`,
      icon: <Github className="h-4 w-4" />,
      accent: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20 hover:border-purple-500/50",
      badge: "Free",
      badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      label: "LeetCode Editorial",
      description:
        "Official editorial by LeetCode. Requires a Premium subscription to view the full solution.",
      href: `https://leetcode.com/problems/${slug}/editorial/`,
      icon: <Lock className="h-4 w-4" />,
      accent: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20 hover:border-orange-500/50",
      badge: "Premium",
      badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
  ];
}

export function OfficialSolution({ titleSlug, title, difficulty }: OfficialSolutionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const resources = buildResources(titleSlug, title);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-all duration-150 cursor-pointer hover:border-teal-500/50 hover:scale-[1.03] active:scale-95">
          <BookOpen className="h-2.5 w-2.5" />
          Solutions
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg flex flex-col p-0 gap-0 overflow-hidden border-teal-500/20">
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-teal-500/15 shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(6,182,212,0.05))",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/25 shrink-0">
                <BookOpen className="h-4 w-4 text-teal-500" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-bold leading-tight text-foreground">
                  Community Solutions
                </span>
                <span className="text-xs font-normal text-muted-foreground leading-tight line-clamp-1 max-w-[300px]">
                  {title}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`ml-auto capitalize text-[11px] px-2 py-0 border shrink-0 ${
                  DIFFICULTY_COLORS[difficulty] ?? ""
                }`}
              >
                {difficulty}
              </Badge>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Resource cards */}
        <div className="flex flex-col gap-2 p-4">
          {resources.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-4 p-3.5 rounded-xl border bg-card transition-all duration-150 hover:bg-muted/40 ${r.border}`}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.bg} ${r.accent} border ${r.border.split(" ")[0]}`}
              >
                {r.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-semibold ${r.accent}`}>
                    {r.label}
                  </span>
                  {r.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0 rounded-full border font-medium ${r.badgeClass}`}
                    >
                      {r.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {r.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-150" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-0">
          <p className="text-[11px] text-muted-foreground/50 text-center">
            Click any resource to open in a new tab · LeetCode editorial requires Premium
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
