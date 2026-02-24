import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Building2, ExternalLink } from "lucide-react";
import { companyList } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface SearchResult {
  title: string;
  slug: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  companies: { name: string; slug: string }[];
}

function buildIndex(): Map<string, SearchResult> {
  const index = new Map<string, SearchResult>();
  for (const company of companyList) {
    for (const problem of company.problems) {
      if (!index.has(problem.slug)) {
        index.set(problem.slug, {
          title: problem.title,
          slug: problem.slug,
          url: problem.url,
          difficulty: problem.difficulty,
          companies: [],
        });
      }
      index.get(problem.slug)!.companies.push({
        name: company.name,
        slug: company.slug,
      });
    }
  }
  return index;
}

const problemIndex = buildIndex();

const difficultyStyles: Record<string, string> = {
  easy:   "text-easy   bg-easy/10   border-easy/20",
  medium: "text-medium bg-medium/10 border-medium/20",
  hard:   "text-hard   bg-hard/10   border-hard/20",
};

export function ProblemSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback((q: string) => {
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const hits: SearchResult[] = [];
    for (const entry of problemIndex.values()) {
      if (entry.title.toLowerCase().includes(trimmed)) {
        hits.push(entry);
        if (hits.length >= 12) break;
      }
    }
    // Sort: exact prefix first
    hits.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(trimmed) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(trimmed) ? 0 : 1;
      return aStarts - bStarts || a.title.localeCompare(b.title);
    });
    setResults(hits);
    setOpen(hits.length > 0 || trimmed.length >= 2);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
          focused
            ? "border-primary/60 bg-background shadow-lg shadow-primary/10 ring-1 ring-primary/20"
            : "border-border/60 bg-muted/30 hover:border-border"
        }`}
      >
        <Search
          className={`h-4 w-4 shrink-0 transition-colors ${
            focused ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <input
          type="text"
          placeholder="Search any LeetCode problem to see which companies ask it…"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 w-full rounded-xl border border-border overflow-hidden shadow-2xl shadow-black/30"
          style={{ background: "hsl(var(--card))", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px hsl(var(--border))" }}
        >
          {results.length > 0 ? (
            <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30">
              {results.map((r) => (
                <a
                  key={r.slug}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 px-4 py-3.5 hover:bg-muted/50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {/* Problem title + difficulty */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {r.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] capitalize px-2 py-0 border ${difficultyStyles[r.difficulty]}`}
                    >
                      {r.difficulty}
                    </Badge>
                  </div>

                  {/* Company chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pl-5">
                    <Building2 className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    {r.companies.slice(0, 8).map((c) => (
                      <Link
                        key={c.slug}
                        to={`/companies/${c.slug}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(false);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 hover:bg-primary/20 hover:text-primary transition-colors border border-primary/20 font-medium"
                      >
                        {c.name}
                      </Link>
                    ))}
                    {r.companies.length > 8 && (
                      <span className="text-[11px] text-muted-foreground/60">
                        +{r.companies.length - 8} more
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Search className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">No problems found</p>
              <p className="text-xs text-muted-foreground/60 max-w-[240px]">
                Try a different spelling or a shorter keyword
              </p>
            </div>
          )}

          {/* Footer hint */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-border/30 bg-muted/20">
              <p className="text-[11px] text-muted-foreground/50">
                Click a company chip to view its full problem list · Click problem to open on LeetCode
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
