import { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "./StatusBadge";
import { GaugeChart } from "./GaugeChart";
import { LineChart } from "./LineChart";
import { fetchSystemStats, fetchHAStatus, SystemStats, HANode } from "@/lib/api";
import { Activity, Cpu, HardDrive, Wifi } from "lucide-react";

interface OverviewTabProps {
  selectedNode: string;
  refreshTrigger: number;
}

export function OverviewTab({ selectedNode, refreshTrigger }: OverviewTabProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [haNodes, setHaNodes] = useState<HANode[]>([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);
  const [httpRate, setHttpRate] = useState(0);
  const [httpHistory, setHttpHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, haRes] = await Promise.all([
        fetchSystemStats(selectedNode),
        fetchHAStatus(),
      ]);

      if (statsRes.ok && statsRes.data) {
        setStats(statsRes.data);
        const ns = statsRes.data.ns_stats?.ns || {};
        const cpu = parseFloat(String(ns.cpuusagepcnt || ns.cpuusage || 0));
        const mem = parseFloat(String(ns.memusagepcnt || ns.memusagepct || 0));
        const http = parseFloat(String(ns.httprequestsrate || 0));

        setCpuUsage(cpu);
        setMemUsage(mem);
        setHttpRate(http);
        setHttpHistory((prev) => {
          const newHistory = [...prev, http];
          return newHistory.slice(-20);
        });
      }

      if (haRes.ok && haRes.data?.hanode) {
        setHaNodes(haRes.data.hanode);
      }
    } catch (error) {
      console.error("Failed to load overview data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedNode]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData, refreshTrigger]);

  const getHARole = (role: string) => {
    const upper = role.toUpperCase();
    if (upper.includes("PRIMARY")) return "PRIMARY";
    if (upper.includes("SECONDARY")) return "SECONDARY";
    if (upper.includes("STANDALONE")) return "STANDALONE";
    return role || "Unknown";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Usage */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-primary" />
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
              CPU Usage
            </h3>
          </div>
          <GaugeChart
            value={cpuUsage}
            max={100}
            color="hsl(24, 95%, 53%)"
          />
          <div className="mt-3 text-2xl font-bold font-mono text-primary">
            {cpuUsage.toFixed(1)}%
          </div>
        </div>

        {/* Memory Usage */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-chart-4" />
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
              Memory Usage
            </h3>
          </div>
          <GaugeChart
            value={memUsage}
            max={100}
            color="hsl(280, 65%, 60%)"
          />
          <div className="mt-3 text-2xl font-bold font-mono text-chart-4">
            {memUsage.toFixed(1)}%
          </div>
        </div>

        {/* HTTP Traffic */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-info" />
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
              HTTP Traffic (Live)
            </h3>
          </div>
          <div className="w-full h-28">
            <LineChart
              data={httpHistory.length > 0 ? httpHistory : [0]}
              color="hsl(217, 91%, 60%)"
              height={112}
            />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-info">
            {Math.round(httpRate)} req/s
          </div>
        </div>
      </div>

      {/* Node Statistics & HA Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Statistics */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Node Statistics</h3>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          ) : stats ? (
            <table className="data-table">
              <tbody>
                <tr>
                  <td className="text-muted-foreground w-32">IP Address</td>
                  <td className="font-mono text-foreground">{stats.ip || "N/A"}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Hostname</td>
                  <td className="font-mono text-foreground">{stats.hostname || "N/A"}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Version</td>
                  <td className="text-foreground">{stats.version || "N/A"}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">HA Role</td>
                  <td>
                    <StatusBadge status={getHARole(stats.ha_role || "")} />
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No data available</p>
          )}
        </div>

        {/* High Availability */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">High Availability</h3>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : haNodes.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>IP</th>
                    <th>Hostname</th>
                    <th>State</th>
                    <th>Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {haNodes.map((node, i) => (
                    <tr key={i}>
                      <td className="text-muted-foreground font-mono">{i + 1}</td>
                      <td className="font-mono text-muted-foreground text-sm">
                        {node.ipaddress || node.ip || "N/A"}
                      </td>
                      <td className="font-mono text-foreground text-sm">
                        {node.hostname || "N/A"}
                      </td>
                      <td>
                        <StatusBadge status={node.state || node.hacurstate || "Unknown"} />
                      </td>
                      <td className="text-muted-foreground text-xs">{node.hasync || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No HA nodes configured</p>
          )}
        </div>
      </div>
    </div>
  );
}
