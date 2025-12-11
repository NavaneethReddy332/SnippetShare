import { useState, useCallback, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { api } from "@/lib/api";
import { detectLanguage, languages, getExtension } from "@/lib/language-detect";
import { useLocation, useSearch } from "wouter";
import { Lock, Unlock, ChevronDown, Plus, FileCode, FolderKanban, Loader2, Circle, Key, X, PanelRight, FolderOpen, ExternalLink, Search, Replace } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, FadeIn } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TabData {
  id: string;
  code: string;
  title: string;
  language: string;
  isPrivate: boolean;
  password: string;
  autoDetected: boolean;
  hasUnsavedChanges: boolean;
}

const TABS_STORAGE_KEY = 'snippetshare_tabs';
const ACTIVE_TAB_STORAGE_KEY = 'snippetshare_active_tab';

const createNewTab = (): TabData => ({
  id: crypto.randomUUID(),
  code: "",
  title: "",
  language: "",
  isPrivate: false,
  password: "",
  autoDetected: false,
  hasUnsavedChanges: false,
});

const loadTabsFromStorage = (): { tabs: TabData[], activeTabId: string } => {
  try {
    const savedTabs = localStorage.getItem(TABS_STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    
    if (savedTabs) {
      const parsed = JSON.parse(savedTabs) as TabData[];
      if (parsed.length > 0) {
        const activeId = savedActiveId && parsed.find(t => t.id === savedActiveId) 
          ? savedActiveId 
          : parsed[0].id;
        return { tabs: parsed, activeTabId: activeId };
      }
    }
  } catch (e) {
    console.error('Failed to load tabs from storage:', e);
  }
  
  const defaultTab = createNewTab();
  return { tabs: [defaultTab], activeTabId: defaultTab.id };
};

export default function Home() {
  const [_, setLocation] = useLocation();
  const searchString = useSearch();
  
  const { tabs: initialTabs, activeTabId: initialActiveId } = loadTabsFromStorage();
  const [tabs, setTabs] = useState<TabData[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState(initialActiveId);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [findDialogOpen, setFindDialogOpen] = useState(false);
  const [findReplaceDialogOpen, setFindReplaceDialogOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [lastFindIndex, setLastFindIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialLoad = useRef(true);
  
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  const updateActiveTab = (updates: Partial<TabData>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const codeParam = params.get("code");
    const langParam = params.get("lang");
    const titleParam = params.get("title");
    
    if (codeParam) {
      updateActiveTab({
        code: codeParam,
        language: langParam || "",
        autoDetected: !langParam,
        title: titleParam ? titleParam.replace(/\.[^/.]+$/, "") : "",
      });
      window.history.replaceState({}, "", "/");
    }
  }, [searchString]);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (activeTab.code.trim() || activeTab.title.trim()) {
      updateActiveTab({ hasUnsavedChanges: true });
    }
  }, [activeTab.code, activeTab.title]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
    } catch (e) {
      console.error('Failed to save tabs to storage:', e);
    }
  }, [tabs, activeTabId]);

  const handleCodeChange = useCallback((newCode: string) => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    
    let updates: Partial<TabData> = { code: newCode, hasUnsavedChanges: true };
    
    if (!tab.language || tab.autoDetected) {
      const detected = detectLanguage(newCode);
      if (detected) {
        updates.language = detected;
        updates.autoDetected = true;
      }
    }
    
    updateActiveTab(updates);
  }, [activeTabId, tabs]);

  const handleLanguageChange = (newLang: string) => {
    updateActiveTab({ language: newLang, autoDetected: false });
  };

  const handleProjectClick = () => {
    toast.info("Projects coming soon!");
  };

  const handleSave = async () => {
    if (!activeTab.code.trim()) {
      toast.error("Enter some code first");
      return;
    }
    
    if (!activeTab.language) {
      toast.error("Please select a language");
      return;
    }
    
    const ext = getExtension(activeTab.language);
    const finalTitle = activeTab.title.trim() || "untitled";
    const titleWithExt = finalTitle.endsWith(ext) ? finalTitle : `${finalTitle}${ext}`;
    
    setSaving(true);
    try {
      const snippet = await api.snippets.create({ 
        title: titleWithExt, 
        code: activeTab.code, 
        language: activeTab.language, 
        isPrivate: activeTab.isPrivate,
        password: activeTab.isPrivate && activeTab.password.trim() ? activeTab.password.trim() : undefined
      });
      updateActiveTab({ hasUnsavedChanges: false });
      toast.success("Snippet Saved");
      setLocation(`/snippet/${snippet.id}`);
    } catch (error) {
      toast.error("Failed to save snippet");
    } finally {
      setSaving(false);
    }
  };

  const addNewTab = () => {
    if (tabs.length >= 3) {
      toast.error("Maximum 3 tabs allowed");
      return;
    }
    const newTab = createNewTab();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const newTab = createNewTab();
      setTabs([newTab]);
      setActiveTabId(newTab.id);
      return;
    }
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const ext = file.name.split('.').pop()?.toLowerCase() || "";
      
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'py': 'python',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'php': 'php',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'sql': 'sql',
        'sh': 'bash',
        'yml': 'yaml',
        'yaml': 'yaml',
      };
      
      const detectedLang = langMap[ext] || detectLanguage(content) || "";
      
      if (tabs.length < 3) {
        const newTab = createNewTab();
        newTab.code = content;
        newTab.title = fileName;
        newTab.language = detectedLang;
        newTab.autoDetected = !langMap[ext];
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      } else {
        updateActiveTab({
          code: content,
          title: fileName,
          language: detectedLang,
          autoDetected: !langMap[ext],
          hasUnsavedChanges: true,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleNewWindow = () => {
    window.open(window.location.origin, '_blank');
  };

  const handleFind = () => {
    setFindDialogOpen(true);
    setFindReplaceDialogOpen(false);
    setSidebarOpen(false);
    setLastFindIndex(-1);
  };

  const handleFindReplace = () => {
    setFindReplaceDialogOpen(true);
    setFindDialogOpen(false);
    setSidebarOpen(false);
  };

  const performFind = () => {
    if (!findText) return;
    const textarea = document.querySelector('[data-testid="textarea-code"]') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const code = activeTab.code.toLowerCase();
    const searchText = findText.toLowerCase();
    const startPos = lastFindIndex + 1;
    
    let index = code.indexOf(searchText, startPos);
    
    if (index === -1 && startPos > 0) {
      index = code.indexOf(searchText, 0);
      if (index !== -1) {
        toast.info("Wrapped to beginning");
      }
    }
    
    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + findText.length);
      setLastFindIndex(index);
    } else {
      toast.error("Not found");
      setLastFindIndex(-1);
    }
  };

  const performReplace = () => {
    if (!findText) return;
    const newCode = activeTab.code.replace(new RegExp(findText, 'gi'), replaceText);
    updateActiveTab({ code: newCode, hasUnsavedChanges: true });
    toast.success("Replaced all occurrences");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        handleNewWindow();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        handleFind();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        handleFindReplace();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayLanguage = activeTab.language 
    ? languages.find(l => l.id === activeTab.language)?.name || activeTab.language 
    : "Select Language";

  return (
    <Layout>
      <PageTransition className="h-full relative flex flex-col">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".js,.jsx,.ts,.tsx,.py,.rb,.go,.rs,.java,.cpp,.c,.cs,.php,.html,.css,.json,.md,.sql,.sh,.yml,.yaml,.txt"
          onChange={handleFileChange}
          data-testid="input-file"
        />
        
        <FadeIn>
          <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-editor-bg z-10">
          
          <div className="flex bg-card border border-border rounded-sm p-0.5">
             <button 
               className="px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors bg-primary/20 text-primary"
               data-testid="button-snippet-mode"
             >
               <FileCode className="w-3 h-3" /> Snippet
             </button>
             <button 
               onClick={handleProjectClick}
               className="px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground"
               data-testid="button-project-mode"
             >
               <FolderKanban className="w-3 h-3" /> Project
             </button>
          </div>

          <div className="h-4 w-px bg-border/50 mx-1"></div>

          <div className="flex items-center">
            <AnimatePresence mode="popLayout">
              {tabs.map((tab) => (
                <motion.div
                  key={tab.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: "easeOut",
                    layout: { duration: 0.2 }
                  }}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer transition-colors border-b-2 ${
                    tab.id === activeTabId
                      ? 'bg-card text-foreground border-b-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50 border-b-transparent'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.hasUnsavedChanges && (
                    <Circle className="w-1.5 h-1.5 fill-primary text-primary" />
                  )}
                  <input
                    type="text"
                    value={tab.title || ""}
                    placeholder="Untitled"
                    onChange={(e) => {
                      if (tab.id === activeTabId) {
                        updateActiveTab({ title: e.target.value });
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 bg-transparent text-[11px] focus:outline-none placeholder:text-muted-foreground"
                    data-testid={`input-tab-title-${tab.id}`}
                  />
                  <motion.button
                    onClick={(e) => closeTab(tab.id, e)}
                    className="p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid={`close-tab-${tab.id}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            {tabs.length < 3 && (
              <motion.button
                onClick={addNewTab}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                data-testid="button-add-tab"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="w-28 relative">
               <select 
                 value={activeTab.language}
                 onChange={(e) => handleLanguageChange(e.target.value)}
                 className={`w-full appearance-none bg-card border border-border rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-primary/50 cursor-pointer transition-colors h-7 pl-2 pr-6 ${activeTab.language ? 'text-foreground' : 'text-muted-foreground'}`}
                 data-testid="select-language"
               >
                 <option value="">Language</option>
                 {languages.map(lang => (
                   <option key={lang.id} value={lang.id}>{lang.name}</option>
                 ))}
               </select>
               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>

            <button 
              onClick={() => {
                updateActiveTab({ isPrivate: !activeTab.isPrivate });
                if (activeTab.isPrivate) updateActiveTab({ password: "" });
              }}
              className={`h-7 px-2 border rounded-sm flex items-center gap-1 text-xs transition-all ${
                activeTab.isPrivate 
                  ? 'border-primary/30 bg-primary/10 text-primary' 
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
              data-testid="button-privacy"
            >
              {activeTab.isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            <AnimatePresence>
              {activeTab.isPrivate && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Key className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={activeTab.password}
                      onChange={(e) => updateActiveTab({ password: e.target.value })}
                      className="h-7 w-24 pl-7 pr-2 text-xs bg-card border border-border rounded-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/60"
                      data-testid="input-password"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-3 bg-primary text-primary-foreground text-xs font-bold rounded-sm hover:bg-primary/90 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-save"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Save
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`h-7 px-2 border rounded-sm flex items-center gap-1 text-xs transition-all ${
                sidebarOpen 
                  ? 'border-primary/30 bg-primary/10 text-primary' 
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
              data-testid="button-sidebar-toggle"
            >
              <PanelRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        </FadeIn>

        <div className="flex-1 min-h-0 flex bg-editor-bg">
          <div className="flex-1 flex">
            <CodeEditor 
              initialCode={activeTab.code} 
              language={activeTab.language || "javascript"}
              onChange={handleCodeChange}
              title={activeTab.title || "untitled"}
              className="flex-1 h-full border-none rounded-none"
              compact={true}
            />
          </div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="border-l border-border/50 bg-card overflow-hidden"
              >
                <div className="p-3 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">File</h3>
                    <div className="space-y-1">
                      <button
                        onClick={handleOpenFile}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                        data-testid="button-open-file"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Open File</span>
                      </button>
                      <button
                        onClick={handleNewWindow}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                        data-testid="button-new-window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">New Window</span>
                        <span className="text-[10px] text-muted-foreground/60">Ctrl+L</span>
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Edit</h3>
                    <div className="space-y-1">
                      <button
                        onClick={handleFind}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                        data-testid="button-find"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">Find</span>
                        <span className="text-[10px] text-muted-foreground/60">Ctrl+F</span>
                      </button>
                      <button
                        onClick={handleFindReplace}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                        data-testid="button-find-replace"
                      >
                        <Replace className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">Find & Replace</span>
                        <span className="text-[10px] text-muted-foreground/60">Ctrl+H</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {findDialogOpen && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-24 right-4 bg-card border border-border rounded-md shadow-lg p-3 z-20"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Find..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performFind()}
                  className="w-48 px-2 py-1 text-xs bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
                  autoFocus
                  data-testid="input-find"
                />
                <Button size="sm" variant="ghost" onClick={performFind} data-testid="button-find-next">
                  <Search className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setFindDialogOpen(false)} data-testid="button-close-find">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {findReplaceDialogOpen && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-24 right-4 bg-card border border-border rounded-md shadow-lg p-3 z-20"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Find..."
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    className="w-48 px-2 py-1 text-xs bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
                    autoFocus
                    data-testid="input-find-replace-find"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Replace..."
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="w-48 px-2 py-1 text-xs bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
                    data-testid="input-replace"
                  />
                  <Button size="sm" variant="ghost" onClick={performReplace} data-testid="button-replace-all">
                    <Replace className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setFindReplaceDialogOpen(false)} data-testid="button-close-replace">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </PageTransition>
    </Layout>
  );
}
