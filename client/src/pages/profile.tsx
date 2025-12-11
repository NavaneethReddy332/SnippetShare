import { Layout } from "@/components/layout";
import { User, Shield, CreditCard, AlertTriangle, Loader2, PieChart, MoreVertical, Eye, Share2, Trash2, Lock, Unlock, Pencil, ExternalLink, FileCode, Monitor, Smartphone, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, UserStats } from "@/lib/api";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import type { Snippet } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "overview" | "account" | "security" | "billing" | "danger";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { user, isLoading } = useAuth();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, height: 0 });

  const tabs = [
    { id: "overview" as TabId, label: "Overview", icon: PieChart },
    { id: "account" as TabId, label: "Account", icon: User },
    { id: "security" as TabId, label: "Security", icon: Shield },
    { id: "billing" as TabId, label: "Billing", icon: CreditCard },
    { id: "danger" as TabId, label: "Danger Zone", icon: AlertTriangle },
  ];

  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;
    
    const activeButton = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeButton) {
      setHighlightStyle({
        top: activeButton.offsetTop,
        height: activeButton.offsetHeight,
      });
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Please log in to view your profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-border/50 flex flex-col bg-sidebar-bg/50 backdrop-blur-sm">
          <nav 
            ref={navContainerRef}
            className="relative flex-1 p-3 space-y-1"
          >
            <div 
              className="absolute left-3 right-3 bg-cyan-500/5 border-r-2 border-cyan-500 rounded-md transition-all duration-300 ease-out pointer-events-none"
              style={{ 
                top: highlightStyle.top, 
                height: highlightStyle.height,
                opacity: highlightStyle.height > 0 ? 1 : 0,
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)'
              }}
            />
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className={`w-4 h-4 transition-all ${
                  activeTab === tab.id ? "text-cyan-500" : ""
                }`} style={activeTab === tab.id ? { filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))' } : {}} />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full border border-border/50 bg-muted flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`} 
                  alt={user.username}
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground" data-testid="text-username">{user.username}</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8 md:p-12">
          <div className="max-w-2xl">
            {activeTab === "overview" && <OverviewTab username={user.username} />}
            {activeTab === "account" && <AccountTab username={user.username} />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "danger" && <DangerTab />}
          </div>
        </main>
      </div>
    </Layout>
  );
}

function OverviewTab({ username }: { username: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    Promise.all([
      api.auth.getStats(),
      api.snippets.getMy()
    ])
      .then(([statsData, snippetsData]) => {
        setStats(statsData);
        setSnippets(snippetsData);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      try {
        await api.snippets.delete(id);
        setSnippets(prev => prev.filter(s => s.id !== id));
        toast.success("Snippet deleted");
      } catch {
        toast.error("Failed to delete snippet");
      }
    }
    setOpenMenuId(null);
  };

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/snippet/${id}`);
    toast.success("Link copied to clipboard");
    setOpenMenuId(null);
  };

  const handleView = (id: string) => {
    setLocation(`/snippet/${id}`);
    setOpenMenuId(null);
  };

  const handleOpenInEditor = (snippet: Snippet) => {
    setLocation(`/?code=${encodeURIComponent(snippet.code)}&lang=${snippet.language}&title=${encodeURIComponent(snippet.title)}`);
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const snippetPercentage = stats ? Math.min((stats.totalSnippets / 100) * 100, 100) : 0;
  const viewPercentage = stats ? Math.min((stats.totalViews / 10000) * 100, 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time system overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-border/30">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold">Snippets Created</h3>
            <Badge variant="secondary" className="text-xs">{snippetPercentage.toFixed(0)}%</Badge>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${snippetPercentage}%`, boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats?.totalSnippets || 0} Created</span>
              <span>100 Limit</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-border/30">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold">Total Views</h3>
            <Badge variant="secondary" className="text-xs">Healthy</Badge>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${viewPercentage}%`, boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats?.totalViews.toLocaleString() || 0} Views</span>
              <span>10k Limit</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 border-border/30">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold">Your Files</h3>
          <Badge variant="outline" className="text-xs">{snippets.length} files</Badge>
        </div>
        
        <div className="space-y-0">
          {snippets.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No snippets yet. Create your first one!
            </div>
          ) : (
            snippets.map((snippet) => (
              <div 
                key={snippet.id}
                className="group flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    <FileCode className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{snippet.title}</p>
                      {snippet.isPrivate ? (
                        <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Unlock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono uppercase">{snippet.language}</span>
                      <span>{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {snippet.views}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === snippet.id ? null : snippet.id)}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    data-testid={`button-menu-${snippet.id}`}
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <AnimatePresence>
                    {openMenuId === snippet.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden"
                      >
                        <button
                          onClick={() => handleView(snippet.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                          data-testid={`button-view-${snippet.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleOpenInEditor(snippet)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                          data-testid={`button-edit-${snippet.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleShare(snippet.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                          data-testid={`button-share-${snippet.id}`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Share
                        </button>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => handleDelete(snippet.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                          data-testid={`button-delete-${snippet.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function AccountTab({ username }: { username: string }) {
  const [displayName, setDisplayName] = useState(username);
  const [saving, setSaving] = useState(false);
  const { refreshUser } = useAuth();

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    
    setSaving(true);
    try {
      await api.auth.updateProfile({ username: displayName.trim() });
      await refreshUser();
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings.</p>
      </div>

      <Card className="p-5 border-border/30">
        <h3 className="text-sm font-semibold mb-5">Profile Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              data-testid="input-display-name"
            />
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="ml-auto"
            data-testid="button-save-profile"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="p-5 border-border/30">
        <h3 className="text-sm font-semibold mb-5">Preferences</h3>
        <div className="space-y-4">
          <PreferenceRow 
            title="Email Notifications" 
            description="Receive email updates about your snippets"
          />
          <PreferenceRow 
            title="Auto-delete Snippets" 
            description="Automatically delete snippets after 7 days of inactivity"
          />
          <PreferenceRow 
            title="Public Profile" 
            description="Allow others to see your public snippets"
            defaultEnabled
          />
        </div>
      </Card>
    </div>
  );
}

function PreferenceRow({ title, description, defaultEnabled = false }: { title: string; description: string; defaultEnabled?: boolean }) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch 
        checked={enabled} 
        onCheckedChange={setEnabled}
        data-testid={`toggle-${title.toLowerCase().replace(/\s/g, '-')}`}
      />
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your security settings.</p>
      </div>

      <Card className="p-5 border-border/30">
        <h3 className="text-sm font-semibold mb-5">Authentication</h3>
        <div className="space-y-0">
          <SecurityRow
            title="Password"
            description="Last changed 30 days ago"
            action="Change"
            onClick={() => toast.info("Coming soon")}
          />
          <SecurityRow
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            action="Enable"
            onClick={() => toast.info("Coming soon")}
          />
        </div>
      </Card>

      <Card className="p-5 border-border/30">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h3 className="text-sm font-semibold">Active Sessions</h3>
          <Badge variant="outline" className="text-xs">2 Devices</Badge>
        </div>
        
        <div className="space-y-0">
          <SessionItem 
            icon={Monitor}
            device="MacBook Pro"
            location="San Francisco, US"
            isActive
          />
          <SessionItem 
            icon={Smartphone}
            device="iPhone 15"
            location="San Francisco, US"
          />
        </div>
      </Card>

      <Card className="p-5 border-border/30">
        <h3 className="text-sm font-semibold mb-4">API Key</h3>
        <div 
          className="bg-background border border-dashed border-border rounded-md px-4 py-3 font-mono text-sm text-muted-foreground flex items-center justify-between cursor-pointer group transition-colors hover:border-muted-foreground hover:text-foreground"
          onClick={() => {
            navigator.clipboard.writeText("sk-xxxx-xxxx-xxxx-xxxx");
            toast.success("API key copied to clipboard");
          }}
          data-testid="button-copy-api-key"
        >
          <span className="blur-sm group-hover:blur-none transition-all">sk-xxxx-xxxx-xxxx-xxxx</span>
          <Globe className="w-4 h-4" />
        </div>
      </Card>
    </div>
  );
}

function SecurityRow({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Button 
        variant="ghost"
        size="sm"
        onClick={onClick}
        data-testid={`button-${action.toLowerCase()}`}
      >
        {action}
      </Button>
    </div>
  );
}

function SessionItem({ icon: Icon, device, location, isActive }: { icon: React.ElementType; device: string; location: string; isActive?: boolean }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-muted rounded-md flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{device}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{location}</p>
        </div>
      </div>
      {isActive && (
        <div 
          className="w-2 h-2 bg-cyan-500 rounded-full"
          style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
        />
      )}
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payments.</p>
      </div>

      <Card className="p-5 border-border/30">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h3 className="text-sm font-semibold">Current Plan</h3>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-lg font-semibold">Free Plan</p>
            <p className="text-xs text-muted-foreground mt-1">100 snippets, basic features</p>
          </div>
          <p className="text-2xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
        </div>
        
        <Button 
          className="w-full"
          onClick={() => toast.info("Coming soon")}
          data-testid="button-upgrade"
        >
          Upgrade to Pro
        </Button>
      </Card>

      <Card className="p-5 border-border/30">
        <h3 className="text-sm font-semibold mb-4">Pro Plan Benefits</h3>
        <ul className="space-y-3">
          {[
            "Unlimited snippets",
            "Private snippets",
            "Custom domains",
            "Priority support",
            "API access"
          ].map((benefit, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" style={{ boxShadow: '0 0 6px rgba(6, 182, 212, 0.6)' }} />
              {benefit}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function DangerTab() {
  const handleDeleteAllSnippets = async () => {
    if (!confirm("Delete all snippets? This cannot be undone.")) return;
    
    try {
      const snippets = await api.snippets.getMy();
      await Promise.all(snippets.map((s: { id: string }) => api.snippets.delete(s.id)));
      toast.success("All snippets deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Danger Zone</h1>
        <p className="text-sm text-muted-foreground mt-1">Irreversible and destructive actions.</p>
      </div>

      <Card className="p-5 border-destructive/30">
        <div className="space-y-0">
          <DangerRow
            title="Delete All Snippets"
            description="Permanently remove all your snippets"
            buttonText="Delete All"
            onClick={handleDeleteAllSnippets}
          />
          <DangerRow
            title="Export Data"
            description="Download all your data"
            buttonText="Export"
            onClick={() => toast.info("Coming soon")}
          />
          <DangerRow
            title="Delete Account"
            description="Permanently delete your account and all data"
            buttonText="Delete Account"
            onClick={() => toast.info("Coming soon")}
          />
        </div>
      </Card>
    </div>
  );
}

function DangerRow({ title, description, buttonText, onClick }: { title: string; description: string; buttonText: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Button 
        variant="outline"
        size="sm"
        onClick={onClick}
        data-testid={`button-${buttonText.toLowerCase().replace(/\s/g, '-')}`}
      >
        {buttonText}
      </Button>
    </div>
  );
}
