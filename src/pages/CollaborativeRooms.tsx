import { useState } from "react";
import { Users, Plus, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRooms } from "@/hooks/useRooms";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function CollaborativeRooms() {
  const { rooms, loading, createRoom, joinRoom, deleteRoom } = useRooms();
  const { user } = useAuth();
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!newRoomName.trim()) return;
    setIsCreating(true);
    const id = await createRoom(newRoomName);
    setIsCreating(false);
    if (id) {
      navigate(`/rooms/${id}`);
    }
  };

  const handleJoin = async () => {
    if (!joinRoomId.trim()) return;
    setIsJoining(true);
    const success = await joinRoom(joinRoomId.trim());
    setIsJoining(false);
    if (success) {
      navigate(`/rooms/${joinRoomId.trim()}`);
    }
  };

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Room ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col animate-fade-in relative max-w-7xl mx-auto w-full px-4 pt-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-orange-500" />
            Study Rooms
          </h1>
          <p className="text-muted-foreground mt-1">Collaborate with friends and solve problems together. Tag <span className="font-mono text-orange-400 text-sm">@mentor</span> in chat to summon the AI.</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Join Room</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join a Study Room</DialogTitle>
                <DialogDescription>
                  Enter the Room ID shared by your friend. Optionally set your display name.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <Input
                  placeholder="Room ID (paste here)"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                />
                <Input
                  placeholder="Your name (optional)"
                  value={joinDisplayName}
                  onChange={(e) => setJoinDisplayName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleJoin} disabled={isJoining || !joinRoomId.trim()}>
                  {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a Study Room</DialogTitle>
                <DialogDescription>
                  Give your room a name, then share the Room ID with friends!
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="e.g. Weekend Grind"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={isCreating || !newRoomName.trim()}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed">
          <h3 className="text-lg font-medium text-foreground">No active rooms</h3>
          <p className="text-muted-foreground mt-2">Create a new room or join an existing one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <Card key={room.id} className="cursor-pointer hover:border-orange-500/40 transition-colors group" onClick={() => navigate(`/rooms/${room.id}`)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{room.name}</CardTitle>
                <CardDescription>Created {new Date(room.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {room.participant_count} {room.participant_count === 1 ? 'participant' : 'participants'}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-xs"
                      onClick={(e) => { e.stopPropagation(); copyRoomId(room.id); }}
                    >
                      {copiedId === room.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copiedId === room.id ? "Copied!" : "Copy ID"}
                    </Button>
                    {room.created_by === user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{room.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the room and all its messages for everyone. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteRoom(room.id)}
                            >
                              Delete Room
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/40 font-mono mt-2 truncate">{room.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
