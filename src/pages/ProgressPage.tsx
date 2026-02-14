import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { companyList, getDifficultyCount } from "@/lib/data";
import { useProgressCtx } from "@/components/AppLayout";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ProgressPage() {
  const { progress, totalSolved, getSolvedCount } = useProgressCtx();

  const totalEasy = companyList.reduce((s, c) => s + getDifficultyCount(c.problems, "easy"), 0);
  const totalMed = companyList.reduce((s, c) => s + getDifficultyCount(c.problems, "medium"), 0);
  const totalHard = companyList.reduce((s, c) => s + getDifficultyCount(c.problems, "hard"), 0);

  const solvedByDifficulty = useMemo(() => {
    let easy = 0, med = 0, hard = 0;
    Object.keys(progress.solved).forEach((key) => {
      const [cs, ps] = key.split("::");
      const company = companyList.find((c) => c.slug === cs);
      const problem = company?.problems.find((p) => p.slug === ps);
      if (problem?.difficulty === "easy") easy++;
      else if (problem?.difficulty === "medium") med++;
      else if (problem?.difficulty === "hard") hard++;
    });
    return { easy, med, hard };
  }, [progress.solved]);

  const pieData = [
    { name: "Easy", value: solvedByDifficulty.easy, color: "hsl(142, 71%, 45%)" },
    { name: "Medium", value: solvedByDifficulty.med, color: "hsl(38, 92%, 50%)" },
    { name: "Hard", value: solvedByDifficulty.hard, color: "hsl(0, 84%, 60%)" },
  ].filter((d) => d.value > 0);

  // Company leaderboard
  const companyLeaderboard = useMemo(() => {
    return companyList
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        solved: getSolvedCount(c.slug, c.problems),
        total: c.problem_count,
      }))
      .filter((c) => c.solved > 0)
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 15);
  }, [getSolvedCount]);

  // Topic heatmap
  const topicStats = useMemo(() => {
    const topics: Record<string, number> = {};
    Object.keys(progress.solved).forEach((key) => {
      const [cs, ps] = key.split("::");
      const company = companyList.find((c) => c.slug === cs);
      const problem = company?.problems.find((p) => p.slug === ps);
      if (problem?.topics) {
        problem.topics.split(", ").forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) topics[trimmed] = (topics[trimmed] || 0) + 1;
        });
      }
    });
    return Object.entries(topics)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [progress.solved]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Analytics</h1>
        <p className="text-muted-foreground mt-1">Your overall preparation stats</p>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-easy">{solvedByDifficulty.easy}</div>
            <p className="text-sm text-muted-foreground mt-1">Easy ({totalEasy} total)</p>
            <Progress value={totalEasy ? (solvedByDifficulty.easy / totalEasy) * 100 : 0} className="h-1.5 mt-2 [&>div]:bg-easy" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-medium">{solvedByDifficulty.med}</div>
            <p className="text-sm text-muted-foreground mt-1">Medium ({totalMed} total)</p>
            <Progress value={totalMed ? (solvedByDifficulty.med / totalMed) * 100 : 0} className="h-1.5 mt-2 [&>div]:bg-medium" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-hard">{solvedByDifficulty.hard}</div>
            <p className="text-sm text-muted-foreground mt-1">Hard ({totalHard} total)</p>
            <Progress value={totalHard ? (solvedByDifficulty.hard / totalHard) * 100 : 0} className="h-1.5 mt-2 [&>div]:bg-hard" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={4}>
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data yet. Start solving!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {companyLeaderboard.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                {companyLeaderboard.map((c, i) => (
                  <div key={c.slug} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="text-muted-foreground">{c.solved}/{c.total}</span>
                      </div>
                      <Progress value={(c.solved / c.total) * 100} className="h-1 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No progress yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Most Practiced Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {topicStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topicStats} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Solve problems to see topic distribution
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
