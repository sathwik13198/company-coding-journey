import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Upload, ExternalLink, Key, CheckCircle, AlertCircle, Eye, EyeOff, Bot } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface UserProfile {
  displayName: string;
  photoURL: string;
  leetcodeUsername: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    photoURL: "",
    leetcodeUsername: "",
  });
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gemini-3-flash-preview");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem(`user_profile_${user.id}`);
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error("Failed to parse profile", e);
        }
      } else {
        // Initialize with basic auth data if available
        setProfile(prev => ({
          ...prev,
          displayName: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          photoURL: user.user_metadata?.avatar_url || "",
        }));
      }
    }
    
    // Load API Key & Model
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) setApiKey(storedKey);
    
    const storedModel = localStorage.getItem("gemini_model");
    if (storedModel) setModelName(storedModel);
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    setLoading(true);
    try {
      localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(profile));
      
      if (apiKey) localStorage.setItem("gemini_api_key", apiKey);
      else localStorage.removeItem("gemini_api_key");

      if (modelName) localStorage.setItem("gemini_model", modelName);
      
      toast.success("Profile & Settings saved!");
    } catch (e) {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const testApiKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) return;
    
    setTesting(true);
    setTestStatus(null);
    try {
      const genAI = new GoogleGenerativeAI(keyToTest);
      const model = genAI.getGenerativeModel({ model: modelName || "gemini-3-flash-preview" });
      await model.generateContent("Hello");
      setTestStatus('success');
      toast.success("API Key is valid!");
      // Auto-save if valid
      localStorage.setItem("gemini_api_key", keyToTest);
    } catch (e: any) {
      console.error(e);
      setTestStatus('error');
      // Extract meaningful error message
      const msg = e.message || "Unknown error";
      if (msg.includes("400")) {
         toast.error("Invalid API Key (400). Please check the key.");
      } else if (msg.includes("403")) {
          toast.error("Permission denied (403). Check API constraints.");
      } else {
          toast.error(`Verification failed: ${msg}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your public profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your photo and personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer border-2 border-border group-hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
                <AvatarImage src={profile.photoURL} className="object-cover" />
                <AvatarFallback className="text-lg bg-secondary"><User className="h-8 w-8" /></AvatarFallback>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Click on the avatar to upload a custom image.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="e.g. John Doe"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leetcode-username">LeetCode Username</Label>
              <div className="flex gap-2">
                <Input
                  id="leetcode-username"
                  placeholder="e.g. neal_wu"
                  value={profile.leetcodeUsername}
                  onChange={(e) => setProfile({ ...profile, leetcodeUsername: e.target.value })}
                />
                {profile.leetcodeUsername && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://leetcode.com/u/${profile.leetcodeUsername}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your LeetCode username to link your profile.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" /> 
              Gemini API Configuration
            </h3>
            
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="model-name">AI Model</Label>
                <div className="relative">
                  <Input
                    id="model-name"
                    placeholder="gemini-1.5-flash"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="pl-9"
                  />
                  <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Default: <code>gemini-3-flash-preview</code>. You can also try <code>gemini-1.5-flash</code>.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaVy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-24"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-10 top-0 h-full px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowKey(!showKey)}
                  type="button"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute right-0 top-0 h-full px-3 font-medium transition-colors ${
                    testStatus === 'success' ? 'text-green-500 hover:text-green-600 hover:bg-green-500/10' :
                    testStatus === 'error' ? 'text-destructive hover:text-destructive hover:bg-destructive/10' :
                    'text-primary hover:text-primary hover:bg-primary/10'
                  }`}
                  onClick={testApiKey}
                  disabled={testing || !apiKey}
                  type="button"
                >
                  {testing ? "Testing..." : "Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {testStatus === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Valid API Key</span>}
                {testStatus === 'error' && <span className="text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Invalid API Key</span>}
                {!testStatus && "Key is stored locally in your browser."}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
