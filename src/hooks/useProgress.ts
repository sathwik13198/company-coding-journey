import { useState, useCallback, useEffect } from "react";
import { UserProgress, DEFAULT_PROGRESS, ProblemNote } from "@/lib/types";

const STORAGE_KEY = "leetcode-tracker-progress";

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_PROGRESS };
}

function saveProgress(p: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const makeKey = (companySlug: string, problemSlug: string) =>
    `${companySlug}::${problemSlug}`;

  const isSolved = useCallback(
    (companySlug: string, problemSlug: string) =>
      !!progress.solved[makeKey(companySlug, problemSlug)],
    [progress.solved]
  );

  const toggleSolved = useCallback(
    (companySlug: string, problemSlug: string) => {
      setProgress((prev) => {
        const key = makeKey(companySlug, problemSlug);
        const newSolved = { ...prev.solved };
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        if (newSolved[key]) {
          delete newSolved[key];
        } else {
          newSolved[key] = true;
        }

        let streak = prev.streak;
        if (today !== prev.lastSolvedDate) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          streak = prev.lastSolvedDate === yesterdayStr ? streak + 1 : 1;
        }

        return {
          ...prev,
          solved: newSolved,
          lastActive: { ...prev.lastActive, [companySlug]: Date.now() },
          streak,
          lastSolvedDate: today,
        };
      });
    },
    []
  );

  const getNote = useCallback(
    (companySlug: string, problemSlug: string): ProblemNote | undefined =>
      progress.notes[makeKey(companySlug, problemSlug)],
    [progress.notes]
  );

  const saveNote = useCallback(
    (companySlug: string, problemSlug: string, note: ProblemNote) => {
      setProgress((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [makeKey(companySlug, problemSlug)]: note,
        },
      }));
    },
    []
  );

  const deleteNote = useCallback(
    (companySlug: string, problemSlug: string) => {
      setProgress((prev) => {
        const newNotes = { ...prev.notes };
        delete newNotes[makeKey(companySlug, problemSlug)];
        return { ...prev, notes: newNotes };
      });
    },
    []
  );

  const getSolvedCount = useCallback(
    (companySlug: string, problems: { slug: string }[]) =>
      problems.filter((p) => progress.solved[makeKey(companySlug, p.slug)])
        .length,
    [progress.solved]
  );

  const totalSolved = Object.keys(progress.solved).length;

  const exportProgress = useCallback(() => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leetcode-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [progress]);

  const importProgress = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setProgress({ ...DEFAULT_PROGRESS, ...data });
      } catch {}
    };
    reader.readAsText(file);
  }, []);

  return {
    progress,
    isSolved,
    toggleSolved,
    getNote,
    saveNote,
    deleteNote,
    getSolvedCount,
    totalSolved,
    exportProgress,
    importProgress,
  };
}
