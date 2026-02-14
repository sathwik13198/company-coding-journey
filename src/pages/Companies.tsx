import { useState, useMemo } from "react";
import { companyList } from "@/lib/data";
import { useProgressCtx } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortBy = "problems" | "name" | "completion";

export default function Companies() {
  const { getSolvedCount } = useProgressCtx();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("problems");

  const filtered = useMemo(() => {
    let list = companyList.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "problems") return b.problem_count - a.problem_count;
      const aPct = getSolvedCount(a.slug, a.problems) / a.problem_count;
      const bPct = getSolvedCount(b.slug, b.problems) / b.problem_count;
      return bPct - aPct;
    });
    return list;
  }, [search, sortBy, getSolvedCount]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground mt-1">
          {companyList.length} companies · Select one to start practicing
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="problems">Most Problems</SelectItem>
            <SelectItem value="name">Alphabetical</SelectItem>
            <SelectItem value="completion">Completion %</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => {
          const solved = getSolvedCount(c.slug, c.problems);
          const pct = c.problem_count ? (solved / c.problem_count) * 100 : 0;
          return (
            <Link key={c.slug} to={`/companies/${c.slug}`}>
              <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg leading-tight">{c.name}</h3>
                    <Badge variant="outline" className="shrink-0 ml-2">
                      {c.problem_count}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{solved} solved</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No companies found matching "{search}"
        </div>
      )}
    </div>
  );
}
