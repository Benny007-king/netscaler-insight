import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ApplicationsTab } from "@/components/dashboard/ApplicationsTab";
import { FailoverTab } from "@/components/dashboard/FailoverTab";
import { SessionsTab } from "@/components/dashboard/SessionsTab";
import { UnlockUserTab } from "@/components/dashboard/UnlockUserTab";
import { fetchCaps } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Layers,
  RefreshCcw,
  Users,
  Unlock,
} from "lucide-react";

type TabType = "overview" | "applications" | "failover" | "sessions" | "unlock";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: Layers },
  { id: "failover", label: "Failover", icon: RefreshCcw },
  { id: "sessions", label: "Sessions", icon: Users },
  { id: "unlock", label: "Unlock User", icon: Unlock },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedNode, setSelectedNode] = useState("primary");
  const [apiModes, setApiModes] = useState({ primary: "nitro", secondary: "nitro" });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [capsLoaded, setCapsLoaded] = useState(false);

  const loadCapabilities = useCallback(async () => {
    try {
      const result = await fetchCaps();
      if (result.ok && result.data?.api_mode) {
        setApiModes(result.data.api_mode);
      }
      setCapsLoaded(true);
    } catch (error) {
      console.error("Failed to load capabilities:", error);
      setCapsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadCapabilities();
  }, [loadCapabilities]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCapabilities();
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currentApiMode = apiModes[selectedNode as keyof typeof apiModes] || "nitro";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header
          selectedNode={selectedNode}
          onNodeChange={setSelectedNode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Capabilities Line */}
        <div className="text-sm text-muted-foreground font-mono bg-background/40 p-3 rounded-lg border border-dashed border-border flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            {capsLoaded ? (
              <>
                Capabilities:{" "}
                <span className="text-primary font-bold">
                  PRI: {(apiModes.primary || "nitro").toUpperCase()}
                </span>{" "}
                |{" "}
                <span className="text-primary font-bold">
                  SEC: {(apiModes.secondary || "nitro").toUpperCase()}
                </span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Detecting system capabilities...
              </>
            )}
          </div>
          <Badge variant="warning" className="text-xs">
            Demo Mode
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-border/50" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "tab-button flex items-center gap-2",
                  activeTab === tab.id && "active"
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <main>
          {activeTab === "overview" && (
            <OverviewTab
              selectedNode={selectedNode}
              refreshTrigger={refreshTrigger}
            />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab
              selectedNode={selectedNode}
              refreshTrigger={refreshTrigger}
              apiMode={currentApiMode}
            />
          )}
          {activeTab === "failover" && (
            <FailoverTab selectedNode={selectedNode} />
          )}
          {activeTab === "sessions" && (
            <SessionsTab selectedNode={selectedNode} />
          )}
          {activeTab === "unlock" && <UnlockUserTab />}
        </main>
      </div>
    </div>
  );
};

export default Index;
