import { Layout } from "@/components/layout";
import { User, Shield, Key, Bell, LogOut, ChevronRight } from "lucide-react";

export default function Profile() {
  return (
    <Layout>
       <div className="max-w-3xl mx-auto space-y-8">
         <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-bold text-black border-4 border-background">
              JD
            </div>
            <div>
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">john.doe@example.com</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded font-medium border border-primary/20">PRO Member</span>
              </div>
            </div>
         </div>

         <div className="space-y-6">
            <Section title="Account Settings">
               <SettingItem icon={User} title="Display Name" value="John Doe" />
               <SettingItem icon={Bell} title="Notifications" value="Enabled" />
            </Section>

            <Section title="Security">
               <SettingItem icon={Key} title="Password" value="••••••••" action="Change" />
               <SettingItem icon={Shield} title="Two-Factor Auth" value="Disabled" action="Enable" />
            </Section>

            <div className="pt-6">
              <h3 className="text-destructive font-bold mb-4 uppercase text-xs tracking-wider">Danger Zone</h3>
              <div className="border border-destructive/20 rounded-lg divide-y divide-destructive/10 overflow-hidden">
                 <div className="p-4 bg-destructive/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Delete All Snippets</h4>
                      <p className="text-xs text-muted-foreground">Permanently remove all your code snippets.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm rounded transition-colors">Delete All</button>
                 </div>
                 <div className="p-4 bg-destructive/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Delete Account</h4>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm rounded transition-colors">Delete Account</button>
                 </div>
              </div>
            </div>
         </div>
       </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
       <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</h2>
       <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
         {children}
       </div>
    </div>
  );
}

function SettingItem({ icon: Icon, title, value, action }: { icon: any, title: string, value: string, action?: string }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
       <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-background border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{value}</p>
          </div>
       </div>
       {action ? (
         <button className="text-xs font-medium text-primary hover:underline">{action}</button>
       ) : (
         <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
       )}
    </div>
  );
}
