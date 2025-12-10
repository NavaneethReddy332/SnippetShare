import { Layout } from "@/components/layout";
import { User, Shield, CreditCard, AlertTriangle, Settings } from "lucide-react";
import { useState } from "react";

type TabId = "overview" | "account" | "security" | "billing" | "danger";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("account");

  const tabs = [
    { id: "overview" as TabId, label: "Overview", icon: User },
    { id: "account" as TabId, label: "Account", icon: Settings },
    { id: "security" as TabId, label: "Security", icon: Shield },
    { id: "billing" as TabId, label: "Billing", icon: CreditCard },
    { id: "danger" as TabId, label: "Danger Zone", icon: AlertTriangle },
  ];

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
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-sm font-bold text-black">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "billing" && <BillingTab />}
          {activeTab === "danger" && <DangerTab />}
        </main>
      </div>
    </Layout>
  );
}

function OverviewTab() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your dashboard</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Snippets" value="12" />
        <StatCard title="Total Views" value="1,234" />
        <StatCard title="This Month" value="5" />
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Stats</h3>
        <p className="text-sm text-muted-foreground">
          You've created 12 snippets and they've been viewed 1,234 times total.
          Your most popular snippet has 523 views.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function AccountTab() {
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
              JD
            </div>
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-card border border-border rounded-md text-sm font-medium hover:bg-white/5 transition-colors">
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
          />
          <SettingRow
            icon={Shield}
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            action="Enable"
          />
        </div>
      </section>
    </div>
  );
}

function BillingTab() {
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
        <button className="w-full px-4 py-2.5 bg-primary text-black rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          Upgrade to Pro
        </button>
      </section>
    </div>
  );
}

function DangerTab() {
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
          />
          <DangerAction
            title="Delete Account"
            description="Permanently delete your account and all associated data."
            buttonText="Delete Account"
            destructive
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
  destructive = false 
}: { 
  title: string; 
  description: string; 
  buttonText: string;
  destructive?: boolean;
}) {
  return (
    <div className="p-6 bg-destructive/5 flex items-center justify-between gap-4">
      <div>
        <h4 className="font-medium text-destructive">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <button 
        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
          destructive 
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-destructive/20 text-destructive hover:bg-destructive/30"
        }`}
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
  action 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  action: string;
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
      <button className="text-sm font-medium text-primary hover:underline">
        {action}
      </button>
    </div>
  );
}
