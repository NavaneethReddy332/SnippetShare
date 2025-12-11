import { Layout } from "@/components/layout";
import { User, Shield, CreditCard, AlertTriangle, Settings, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, UserStats } from "@/lib/api";
import { toast } from "sonner";
import { useLocation } from "wouter";

type TabId = "overview" | "account" | "security" | "billing" | "danger";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  const tabs = [
    { id: "overview" as TabId, label: "Overview", icon: User },
    { id: "account" as TabId, label: "Account", icon: Settings },
    { id: "security" as TabId, label: "Security", icon: Shield },
    { id: "billing" as TabId, label: "Billing", icon: CreditCard },
    { id: "danger" as TabId, label: "Danger", icon: AlertTriangle },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Please log in</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-40 border-r border-border p-2 flex flex-col">
          <nav className="space-y-0.5 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                  activeTab === tab.id
                    ? "text-foreground border border-border"
                    : tab.id === "danger"
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="pt-2 border-t border-border mt-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[9px] font-medium">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs truncate" data-testid="text-username">{user.username}</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4">
          {activeTab === "overview" && <OverviewTab username={user.username} />}
          {activeTab === "account" && <AccountTab username={user.username} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "billing" && <BillingTab />}
          {activeTab === "danger" && <DangerTab />}
        </main>
      </div>
    </Layout>
  );
}

function OverviewTab({ username }: { username: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.getStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="border-b border-border pb-2">
        <h1 className="text-sm font-semibold">Overview</h1>
        <p className="text-xs text-muted-foreground">Welcome, {username}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Snippets" value={stats?.totalSnippets.toString() || "0"} />
        <StatCard title="Views" value={stats?.totalViews.toLocaleString() || "0"} />
        <StatCard title="This Month" value={stats?.thisMonth.toString() || "0"} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-border rounded p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{title}</p>
      <p className="text-lg font-mono font-semibold mt-0.5" data-testid={`stat-${title.toLowerCase()}`}>{value}</p>
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
    <div className="max-w-md space-y-4">
      <div className="border-b border-border pb-2">
        <h1 className="text-sm font-semibold">Account</h1>
        <p className="text-xs text-muted-foreground">Manage settings</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-1.5 text-xs bg-transparent focus:outline-none focus:border-foreground/30"
            data-testid="input-display-name"
          />
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 border border-border rounded text-xs font-medium hover:border-foreground/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          data-testid="button-save-profile"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Save
        </button>
      </div>

      <div className="border-t border-border pt-3 mt-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Preferences</p>
        <div className="space-y-2">
          <PreferenceItem title="Email Notifications" />
          <PreferenceItem title="Auto-delete (7 days)" />
        </div>
      </div>
    </div>
  );
}

function PreferenceItem({ title }: { title: string }) {
  const [enabled, setEnabled] = useState(false);
  
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs">{title}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-8 h-4 rounded-full transition-colors relative border ${
          enabled ? "border-foreground/30" : "border-border"
        }`}
        data-testid={`toggle-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div
          className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-transform ${
            enabled ? "translate-x-4 bg-foreground" : "translate-x-0.5 bg-muted-foreground"
          }`}
        />
      </button>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="max-w-md space-y-4">
      <div className="border-b border-border pb-2">
        <h1 className="text-sm font-semibold">Security</h1>
        <p className="text-xs text-muted-foreground">Manage security</p>
      </div>

      <div className="space-y-2">
        <SettingRow
          title="Password"
          description="Last changed 30 days ago"
          action="Change"
          onClick={() => toast.info("Coming soon")}
        />
        <SettingRow
          title="Two-Factor Auth"
          description="Extra security layer"
          action="Enable"
          onClick={() => toast.info("Coming soon")}
        />
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="max-w-md space-y-4">
      <div className="border-b border-border pb-2">
        <h1 className="text-sm font-semibold">Billing</h1>
        <p className="text-xs text-muted-foreground">Subscription</p>
      </div>

      <div className="border border-border rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Free Plan</span>
          <span className="text-[10px] border border-border rounded px-1.5 py-0.5">Active</span>
        </div>
        <button 
          onClick={() => toast.info("Coming soon")}
          className="w-full px-3 py-1.5 border border-border rounded text-xs font-medium hover:border-foreground/30 transition-colors"
          data-testid="button-upgrade"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

function DangerTab() {
  const handleDeleteAllSnippets = async () => {
    if (!confirm("Delete all snippets? This cannot be undone.")) return;
    
    try {
      const snippets = await api.snippets.getAll();
      await Promise.all(snippets.map(s => api.snippets.delete(s.id)));
      toast.success("All snippets deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="border-b border-border pb-2">
        <h1 className="text-sm font-semibold">Danger Zone</h1>
        <p className="text-xs text-muted-foreground">Destructive actions</p>
      </div>

      <div className="space-y-2">
        <DangerAction
          title="Delete All Snippets"
          buttonText="Delete All"
          onClick={handleDeleteAllSnippets}
        />
        <DangerAction
          title="Delete Account"
          buttonText="Delete"
          onClick={() => toast.info("Coming soon")}
        />
      </div>
    </div>
  );
}

function DangerAction({ title, buttonText, onClick }: { title: string; buttonText: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border">
      <span className="text-xs">{title}</span>
      <button 
        onClick={onClick}
        className="px-2 py-1 text-[10px] border border-border rounded hover:border-foreground/30 transition-colors"
        data-testid={`button-${buttonText.toLowerCase().replace(/\s/g, '-')}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function SettingRow({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border">
      <div>
        <p className="text-xs font-medium">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <button 
        onClick={onClick}
        className="text-xs text-muted-foreground hover:text-foreground"
        data-testid={`button-${action.toLowerCase()}`}
      >
        {action}
      </button>
    </div>
  );
}
