import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { companyList, totalProblems, getDifficultyCount } from "@/lib/data";
import { useProgressCtx } from "@/components/AppLayout";
import { Link } from "react-router-dom";
import { Flame, Target, TrendingUp, BookOpen } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { progress, totalSolved, getSolvedCount } = useProgressCtx();

  const allProblems = companyList.flatMap((c) => c.problems);
  const easySolved = Object.keys(progress.solved).filter((key) => {
    const [cs, ps] = key.split("::");
    const company = companyList.find((c) => c.slug === cs);
    const problem = company?.problems.find((p) => p.slug === ps);
    return problem?.difficulty === "easy";
  }).length;
  const medSolved = Object.keys(progress.solved).filter((key) => {
    const [cs, ps] = key.split("::");
    const company = companyList.find((c) => c.slug === cs);
    const problem = company?.problems.find((p) => p.slug === ps);
    return problem?.difficulty === "medium";
  }).length;
  const hardSolved = Object.keys(progress.solved).filter((key) => {
    const [cs, ps] = key.split("::");
    const company = companyList.find((c) => c.slug === cs);
    const problem = company?.problems.find((p) => p.slug === ps);
    return problem?.difficulty === "hard";
  }).length;

  const totalEasy = companyList.reduce((s, c) => s + getDifficultyCount(c.problems, "easy"), 0);
  const totalMed = companyList.reduce((s, c) => s + getDifficultyCount(c.problems, "medium"), 0);
  const totalHard = companyList.reduce((s, c) => s + getDifficultyCount(c.problems, "hard"), 0);

  const pieData = [
    { name: "Easy", value: easySolved, color: "hsl(142, 71%, 45%)" },
    { name: "Medium", value: medSolved, color: "hsl(38, 92%, 50%)" },
    { name: "Hard", value: hardSolved, color: "hsl(0, 84%, 60%)" },
  ].filter((d) => d.value > 0);

  const recentCompanies = companyList
    .filter((c) => progress.lastActive[c.slug])
    .sort((a, b) => (progress.lastActive[b.slug] || 0) - (progress.lastActive[a.slug] || 0))
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your LeetCode interview prep across {companyList.length} companies
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Problems</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProblems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {companyList.length} companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solved</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSolved}</div>
            <Progress value={totalProblems ? (totalSolved / totalProblems) * 100 : 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.streak} <span className="text-sm font-normal text-muted-foreground">days</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProblems ? ((totalSolved / totalProblems) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown + Pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-easy font-medium">Easy</span>
                <span className="text-muted-foreground">{easySolved} / {totalEasy}</span>
              </div>
              <Progress value={totalEasy ? (easySolved / totalEasy) * 100 : 0} className="h-2 [&>div]:bg-easy" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-medium font-medium">Medium</span>
                <span className="text-muted-foreground">{medSolved} / {totalMed}</span>
              </div>
              <Progress value={totalMed ? (medSolved / totalMed) * 100 : 0} className="h-2 [&>div]:bg-medium" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-hard font-medium">Hard</span>
                <span className="text-muted-foreground">{hardSolved} / {totalHard}</span>
              </div>
              <Progress value={totalHard ? (hardSolved / totalHard) * 100 : 0} className="h-2 [&>div]:bg-hard" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Solved Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={4}>
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Start solving to see your distribution
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Active */}
      {recentCompanies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recently Active</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCompanies.map((c) => {
              const solved = getSolvedCount(c.slug, c.problems);
              return (
                <Link key={c.slug} to={`/companies/${c.slug}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{c.name}</span>
                        <Badge variant="secondary">{solved}/{c.problem_count}</Badge>
                      </div>
                      <Progress value={(solved / c.problem_count) * 100} className="h-1.5" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
