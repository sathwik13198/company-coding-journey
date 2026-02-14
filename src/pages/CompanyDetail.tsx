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
import { ArrowLeft, ExternalLink, Search, StickyNote, FileText } from "lucide-react";

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const company = getCompany(slug || "");
  const { isSolved, toggleSolved, getNote, saveNote, deleteNote, getSolvedCount } = useProgressCtx();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [noteModal, setNoteModal] = useState<Problem | null>(null);

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

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Company not found</p>
        <Link to="/companies" className="text-primary mt-2 inline-block">Back to companies</Link>
      </div>
    );
  }

  const diffBadge = (d: string) => {
    if (d === "easy") return <Badge className="bg-easy/15 text-easy border-easy/30 hover:bg-easy/25">Easy</Badge>;
    if (d === "medium") return <Badge className="bg-medium/15 text-medium border-medium/30 hover:bg-medium/25">Medium</Badge>;
    return <Badge className="bg-hard/15 text-hard border-hard/30 hover:bg-hard/25">Hard</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <Card>
        <CardHeader><CardTitle className="text-2xl">{company.name}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm text-muted-foreground">{solved} / {company.problem_count} solved</span>
            <Badge variant="outline" className="text-easy border-easy/40">Easy: {easy}</Badge>
            <Badge variant="outline" className="text-medium border-medium/40">Medium: {med}</Badge>
            <Badge variant="outline" className="text-hard border-hard/40">Hard: {hard}</Badge>
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
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="unsolved">Unsolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Topic" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Done</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="hidden md:table-cell">Topics</TableHead>
              <TableHead className="w-20 text-right">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const done = isSolved(company.slug, p.slug);
              const hasNote = !!getNote(company.slug, p.slug);
              return (
                <TableRow key={p.slug} className={done ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox checked={done} onCheckedChange={() => toggleSolved(company.slug, p.slug)} />
                  </TableCell>
                  <TableCell>
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className={`font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5 ${done ? "line-through" : ""}`}>
                      {p.title}<ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </TableCell>
                  <TableCell>{diffBadge(p.difficulty)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.topics && p.topics.split(", ").slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                      {p.topics && p.topics.split(", ").length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{p.topics.split(", ").length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNoteModal(p)}>
                      {hasNote ? <FileText className="h-4 w-4 text-primary" /> : <StickyNote className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No problems match your filters</div>
        )}
      </Card>

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
