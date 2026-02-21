import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompany, getDifficultyCount, getAllTopics } from "@/lib/data";
import { useProgressCtx } from "@/components/AppLayout";
import { NoteModal } from "@/components/NoteModal";
import { Problem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Search, StickyNote, FileText, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { SimilarProblems } from "@/components/SimilarProblems";
import { AIAnalysis } from "@/components/AIAnalysis";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PAGE_SIZE = 100;

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const company = getCompany(slug || "");
  const { isSolved, toggleSolved, getNote, saveNote, deleteNote, getSolvedCount } = useProgressCtx();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [noteModal, setNoteModal] = useState<Problem | null>(null);
  const [page, setPage] = useState(1);

  const topics = useMemo(() => company ? getAllTopics(company.problems) : [], [company]);

  const solved = company ? getSolvedCount(company.slug, company.problems) : 0;
  const easy = company ? getDifficultyCount(company.problems, "easy") : 0;
  const med = company ? getDifficultyCount(company.problems, "medium") : 0;
  const hard = company ? getDifficultyCount(company.problems, "hard") : 0;

  const filtered = useMemo(() => {
    if (!company) return [];
    return company.problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (status === "solved" && !isSolved(company.slug, p.slug)) return false;
      if (status === "unsolved" && isSolved(company.slug, p.slug)) return false;
      if (topic !== "all" && (!p.topics || !p.topics.includes(topic))) return false;
      return true;
    });
  }, [company, search, difficulty, status, topic, isSolved]);

  // Reset page when filters change
  useMemo(() => setPage(1), [search, difficulty, status, topic]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Company not found</p>
        <Link to="/companies" className="text-primary mt-2 inline-block">Back to companies</Link>
      </div>
    );
  }

  const diffBadge = (d: string) => {
    if (d === "easy") return <Badge className="bg-easy/15 text-easy border-easy/30 hover:bg-easy/25 text-xs">Easy</Badge>;
    if (d === "medium") return <Badge className="bg-medium/15 text-medium border-medium/30 hover:bg-medium/25 text-xs">Medium</Badge>;
    return <Badge className="bg-hard/15 text-hard border-hard/30 hover:bg-hard/25 text-xs">Hard</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">{company.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium">{solved} / {company.problem_count} solved</span>
            <Badge variant="outline" className="text-easy border-easy/40 text-xs">Easy: {easy}</Badge>
            <Badge variant="outline" className="text-medium border-medium/40 text-xs">Medium: {med}</Badge>
            <Badge variant="outline" className="text-hard border-hard/40 text-xs">Hard: {hard}</Badge>
          </div>
          <Progress value={(solved / company.problem_count) * 100} className="h-2" />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="unsolved">Unsolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Topic" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination header */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} problems
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">Done</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="hidden md:table-cell">Topics</TableHead>
              <TableHead className="w-16 text-right">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((p) => (
              <ProblemRow
                key={p.slug}
                problem={p}
                companySlug={company.slug}
                isSolved={isSolved}
                toggleSolved={toggleSolved}
                getNote={getNote}
                diffBadge={diffBadge}
                setNoteModal={setNoteModal}
              />
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No problems match your filters</div>
        )}
      </Card>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {noteModal && (
        <NoteModal
          open={!!noteModal}
          onClose={() => setNoteModal(null)}
          problem={noteModal}
          note={getNote(company.slug, noteModal.slug)}
          onSave={(note) => saveNote(company.slug, noteModal.slug, note)}
          onDelete={() => deleteNote(company.slug, noteModal.slug)}
        />
      )}
    </div>
  );
}

function ProblemRow({
  problem,
  companySlug,
  isSolved,
  toggleSolved,
  getNote,
  diffBadge,
  setNoteModal
}: {
  problem: Problem;
  companySlug: string;
  isSolved: (c: string, p: string) => boolean;
  toggleSolved: (c: string, p: string) => void;
  getNote: (c: string, p: string) => any;
  diffBadge: (d: string) => React.ReactNode;
  setNoteModal: (p: Problem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const done = isSolved(companySlug, problem.slug);
  const hasNote = !!getNote(companySlug, problem.slug);

  return (
    <>
      <TableRow className={`transition-colors ${done ? "opacity-50 bg-muted/10" : "hover:bg-muted/20"}`}>
        <TableCell>
          <Checkbox checked={done} onCheckedChange={() => toggleSolved(companySlug, problem.slug)} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <a href={problem.url} target="_blank" rel="noopener noreferrer"
              className={`font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5 text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
              {problem.title}<ExternalLink className="h-3 w-3 opacity-40" />
            </a>
            <AIAnalysis title={problem.title} difficulty={problem.difficulty} url={problem.url} />
            <button
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <GitBranch className="h-2.5 w-2.5" />
              {isOpen ? "Hide" : "Similar"}
            </button>
          </div>
        </TableCell>
        <TableCell>{diffBadge(problem.difficulty)}</TableCell>
        <TableCell className="hidden md:table-cell">
          <TooltipProvider>
            <div className="flex flex-wrap gap-1">
              {problem.topics && problem.topics.split(", ").slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
              ))}
              {problem.topics && problem.topics.split(", ").length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-orange-500/20 hover:text-orange-400 transition-colors">
                      +{problem.topics.split(", ").length - 3}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{problem.topics.split(", ").slice(3).join(" · ")}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNoteModal(problem)}>
            {hasNote ? <FileText className="h-4 w-4 text-primary" /> : <StickyNote className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-muted/5 hover:bg-muted/5 border-t-0">
          <TableCell colSpan={5} className="p-0">
            <div className="px-4 py-2 border-b animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">Similar Problems</span>
              </div>
              <SimilarProblems problemSlug={problem.slug} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
