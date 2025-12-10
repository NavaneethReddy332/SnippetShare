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
    { id: "danger" as TabId, label: "Danger Zone", icon: AlertTriangle },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-bold">Not Logged In</h2>
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-border bg-card/50 p-4 flex flex-col">
          <nav className="space-y-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : tab.id === "danger"
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-sm font-bold text-black">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-username">{user.username}</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8">
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {username}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Snippets" value={stats?.totalSnippets.toString() || "0"} />
        <StatCard title="Total Views" value={stats?.totalViews.toLocaleString() || "0"} />
        <StatCard title="This Month" value={stats?.thisMonth.toString() || "0"} />
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Stats</h3>
        <p className="text-sm text-muted-foreground">
          You've created {stats?.totalSnippets || 0} snippets and they've been viewed {stats?.totalViews.toLocaleString() || 0} times total.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</p>
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

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Profile Information
          </h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-2xl font-bold text-black border-4 border-background">
              {initials}
            </div>
            <div>
              <h3 className="font-semibold">{username}</h3>
              <p className="text-sm text-muted-foreground">Member</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                data-testid="input-display-name"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-black rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              data-testid="button-save-profile"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Preferences
          </h2>
        </div>
        
        <div className="divide-y divide-border">
          <PreferenceItem 
            title="Email Notifications"
            description="Receive transfer alerts via email"
          />
          <PreferenceItem 
            title="Auto-delete Files"
            description="Delete files after 7 days"
          />
        </div>
      </section>
    </div>
  );
}

function PreferenceItem({ title, description }: { title: string; description: string }) {
  const [enabled, setEnabled] = useState(false);
  
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
        data-testid={`toggle-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SecurityTab() {
  const [changingPassword, setChangingPassword] = useState(false);
  
  const handleChangePassword = () => {
    toast.info("Password change coming soon!");
  };

  const handleEnable2FA = () => {
    toast.info("2FA coming soon!");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground mt-1">Manage your security settings</p>
      </div>

      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          <SettingRow
            icon={Shield}
            title="Password"
            description="Last changed 30 days ago"
            action="Change"
            onClick={handleChangePassword}
          />
          <SettingRow
            icon={Shield}
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            action="Enable"
            onClick={handleEnable2FA}
          />
        </div>
      </section>
    </div>
  );
}

function BillingTab() {
  const handleUpgrade = () => {
    toast.info("Billing coming soon!");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and payment methods</p>
      </div>

      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Current Plan</h3>
            <p className="text-sm text-muted-foreground">Free Plan</p>
          </div>
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
            Active
          </span>
        </div>
        <button 
          onClick={handleUpgrade}
          className="w-full px-4 py-2.5 bg-primary text-black rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-upgrade"
        >
          Upgrade to Pro
        </button>
      </section>
    </div>
  );
}

function DangerTab() {
  const { logout } = useAuth();
  const [_, setLocation] = useLocation();

  const handleDeleteAllSnippets = async () => {
    if (!confirm("Are you sure you want to delete all your snippets? This cannot be undone.")) {
      return;
    }
    
    try {
      const snippets = await api.snippets.getAll();
      await Promise.all(snippets.map(s => api.snippets.delete(s.id)));
      toast.success("All snippets deleted");
    } catch (error) {
      toast.error("Failed to delete snippets");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }
    
    toast.info("Account deletion coming soon!");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-destructive">Danger Zone</h1>
        <p className="text-muted-foreground mt-1">Irreversible and destructive actions</p>
      </div>

      <section className="border border-destructive/30 rounded-lg overflow-hidden">
        <div className="divide-y divide-destructive/20">
          <DangerAction
            title="Delete All Snippets"
            description="Permanently remove all your code snippets. This action cannot be undone."
            buttonText="Delete All Snippets"
            onClick={handleDeleteAllSnippets}
          />
          <DangerAction
            title="Delete Account"
            description="Permanently delete your account and all associated data."
            buttonText="Delete Account"
            destructive
            onClick={handleDeleteAccount}
          />
        </div>
      </section>
    </div>
  );
}

function DangerAction({ 
  title, 
  description, 
  buttonText, 
  destructive = false,
  onClick
}: { 
  title: string; 
  description: string; 
  buttonText: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="p-6 bg-destructive/5 flex items-center justify-between gap-4">
      <div>
        <h4 className="font-medium text-destructive">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
          destructive 
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-destructive/20 text-destructive hover:bg-destructive/30"
        }`}
        data-testid={`button-${buttonText.toLowerCase().replace(/\s/g, '-')}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function SettingRow({ 
  icon: Icon, 
  title, 
  description, 
  action,
  onClick 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-background border border-border">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick}
        className="text-sm font-medium text-primary hover:underline"
        data-testid={`button-${action.toLowerCase()}`}
      >
        {action}
      </button>
    </div>
  );
}
