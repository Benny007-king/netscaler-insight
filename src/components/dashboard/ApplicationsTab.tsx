import { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "./StatusBadge";
import { fetchLBVServers, fetchServices, LBVServer, Service, ServiceGroup } from "@/lib/api";
import { Layers, Box, AlertTriangle } from "lucide-react";

interface ApplicationsTabProps {
  selectedNode: string;
  refreshTrigger: number;
  apiMode: string;
}

export function ApplicationsTab({ selectedNode, refreshTrigger, apiMode }: ApplicationsTabProps) {
  const [applications, setApplications] = useState<LBVServer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, svcRes] = await Promise.all([
        fetchLBVServers(selectedNode),
        fetchServices(selectedNode),
      ]);

      if (appsRes.ok) {
        setApplications(appsRes.data?.lbvserver || []);
      }

      if (svcRes.ok) {
        setServices(svcRes.data?.service || []);
        setServiceGroups(svcRes.data?.servicegroup || []);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedNode]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const isNitroMode = apiMode !== "nextgen";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mode Notice */}
      {isNitroMode && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Nitro Mode:</strong> Showing LB vServers as Applications (Next-Gen API not available).
          </span>
        </div>
      )}

      {/* Applications / LB vServers */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-background/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Applications</h3>
          </div>
          <span className="badge-info text-xs px-3 py-1 rounded-full">
            Mode: {apiMode.toUpperCase()}
          </span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Name</th>
                <th>VIP</th>
                <th>Port</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : applications.length > 0 ? (
                applications.map((app, i) => (
                  <tr key={i}>
                    <td className="text-muted-foreground font-mono">{i + 1}</td>
                    <td className="font-medium text-foreground">
                      {app.name || app.vservername || `app-${i}`}
                    </td>
                    <td className="font-mono text-info text-sm">
                      {app.ipv46 || app.vip || app.ipaddress || "N/A"}
                    </td>
                    <td className="font-mono text-muted-foreground text-sm">
                      {app.port || "N/A"}
                    </td>
                    <td>
                      <StatusBadge status={app.curstate || app.state || "Unknown"} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-background/30 flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Services</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Type</th>
                <th>Name</th>
                <th>IP</th>
                <th>Port</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : services.length > 0 || serviceGroups.length > 0 ? (
                <>
                  {services.map((svc, i) => (
                    <tr key={`svc-${i}`}>
                      <td className="text-muted-foreground font-mono">{i + 1}</td>
                      <td className="text-xs text-info">SVC</td>
                      <td className="font-medium text-foreground">{svc.name}</td>
                      <td className="font-mono text-muted-foreground text-sm">{svc.ip}</td>
                      <td className="font-mono text-muted-foreground text-sm">{svc.port}</td>
                      <td>
                        <StatusBadge status={svc.curstate || "Unknown"} />
                      </td>
                    </tr>
                  ))}
                  {serviceGroups.map((sg, i) => (
                    <tr key={`sg-${i}`}>
                      <td className="text-muted-foreground font-mono">{services.length + i + 1}</td>
                      <td className="text-xs text-warning">SVCGRP</td>
                      <td className="font-medium text-foreground">{sg.name}</td>
                      <td className="font-mono text-muted-foreground text-sm">—</td>
                      <td className="font-mono text-muted-foreground text-sm">—</td>
                      <td>
                        <StatusBadge status={sg.state || "Unknown"} />
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
