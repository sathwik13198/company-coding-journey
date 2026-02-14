import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Trash2 } from "lucide-react";
import { ProblemNote, Problem } from "@/lib/types";

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  problem: Problem;
  note?: ProblemNote;
  onSave: (note: ProblemNote) => void;
  onDelete: () => void;
}

export function NoteModal({ open, onClose, problem, note, onSave, onDelete }: NoteModalProps) {
  const [intuition, setIntuition] = useState(note?.intuition || "");
  const [code, setCode] = useState(note?.code || "");

  const handleSave = () => {
    onSave({ intuition, code, updatedAt: Date.now() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {problem.title}
            <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-primary">
              <ExternalLink className="h-4 w-4" />
            </a>
          </DialogTitle>
          <DialogDescription>Add your approach notes and solution code</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="intuition">Intuition / Approach</Label>
            <Textarea
              id="intuition"
              placeholder="Describe your approach, key observations, patterns used..."
              value={intuition}
              onChange={(e) => setIntuition(e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="code">Solution Code</Label>
            <Textarea
              id="code"
              placeholder="Paste your solution code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1.5 min-h-[180px] font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {note && (
            <Button variant="destructive" size="sm" onClick={() => { onDelete(); onClose(); }}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
