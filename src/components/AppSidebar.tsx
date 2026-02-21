import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Download,
  Upload,
  Code2,
  LogOut,
  User,
  Bot,
  Users,
  ChevronRight,
  Linkedin,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const navItems = [
  { title: "Dashboard",   url: "/",          icon: LayoutDashboard, color: "text-orange-400",  bg: "bg-orange-500/10"  },
  { title: "Companies",   url: "/companies", icon: Building2,       color: "text-amber-400",   bg: "bg-amber-500/10"   },
  { title: "Progress",    url: "/progress",  icon: BarChart3,       color: "text-teal-400",    bg: "bg-teal-500/10"    },
  { title: "Study Rooms", url: "/rooms",     icon: Users,           color: "text-cyan-400",    bg: "bg-cyan-500/10"    },
  { title: "AI Mentor",   url: "/ai-mentor", icon: Bot,             color: "text-rose-400",    bg: "bg-rose-500/10"    },
  { title: "Profile",     url: "/profile",   icon: User,            color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
];

interface AppSidebarProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export function AppSidebar({ onExport, onImport }: AppSidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();

  return (
    <Sidebar className="border-r border-border/50">
      {/* Logo */}
      <SidebarHeader className="px-5 py-5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 transition-all group-hover:scale-110"
               style={{ background: 'linear-gradient(135deg, #FF6B35, #E84A1D)' }}>
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight" style={{ color: '#FF6B35' }}>
              LeetTracker
            </span>
            {user && (
              <p className="text-[11px] text-muted-foreground/70 truncate max-w-[140px]">{user.email}</p>
            )}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-1">
        {/* Navigation */}
        <SidebarGroup className="p-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold px-3 pb-2 pt-1">
            Navigation
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/60 transition-all duration-150"
                    activeClassName="bg-gradient-to-r from-orange-500/15 to-orange-500/5 text-foreground font-semibold border border-orange-500/20 shadow-sm"
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.bg} transition-all group-hover:scale-110`}>
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                    </span>
                    <span className="text-[13px] tracking-tight">{item.title}</span>
                    <ChevronRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 my-1 h-px bg-border/40" />

        {/* Data */}
        <SidebarGroup className="p-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold px-3 pb-2 pt-1">
            Data
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <button
                  onClick={onExport}
                  className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/60 transition-all duration-150"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10">
                    <Download className="h-3.5 w-3.5 text-teal-400" />
                  </span>
                  <span className="text-[13px] tracking-tight">Export Progress</span>
                </button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/60 transition-all duration-150"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                    <Upload className="h-3.5 w-3.5 text-amber-400" />
                  </span>
                  <span className="text-[13px] tracking-tight">Import Progress</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImport(file);
                  }}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4 space-y-1 border-t border-border/30">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3 py-2.5 h-auto transition-all duration-150"
          onClick={signOut}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
            <LogOut className="h-3.5 w-3.5 text-red-400" />
          </span>
          <span className="text-[13px] tracking-tight">Sign Out</span>
        </Button>

        {/* Creator credit chip */}
        <style>{`
          @keyframes spin-border { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .creator-chip-wrap { position: relative; display: flex; justify-content: center; padding-top: 6px; }
          .creator-chip-wrap::before {
            content: '';
            position: absolute;
            inset: 6px calc(50% - 72px) 0;
            border-radius: 999px;
            padding: 1.5px;
            background: conic-gradient(from 0deg, #FF6B35, #00C8B4, #FF6B35);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: spin-border 2.5s linear infinite;
          }
          .creator-chip {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 3px 12px; border-radius: 999px;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(8px);
            transition: background 0.2s, box-shadow 0.2s;
          }
          .creator-chip:hover {
            background: rgba(255,107,53,0.08);
            box-shadow: 0 0 16px rgba(255,107,53,0.2);
          }
        `}</style>
        <div className="creator-chip-wrap">
          <a
            href="https://www.linkedin.com/in/sathwikpentapati/"
            target="_blank"
            rel="noopener noreferrer"
            className="creator-chip group"
          >
            <span className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Built by</span>
            <Linkedin className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#0A66C2' }} />
            <span
              className="text-[10px] font-bold group-hover:text-white transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Sathwik
            </span>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
