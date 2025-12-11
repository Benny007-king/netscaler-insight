import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { fetchUserSessions, UserSession } from "@/lib/api";
import { Download, Search, Users, Clock, Wifi, Info } from "lucide-react";

interface SessionsTabProps {
  selectedNode: string;
}

export function SessionsTab({ selectedNode }: SessionsTabProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [username, setUsername] = useState("");
  const [sessionType, setSessionType] = useState("all");
  const [sessionStatus, setSessionStatus] = useState("all");
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const result = await fetchUserSessions({
        node: selectedNode,
        from: fromDate,
        to: toDate,
        user: username,
        type: sessionType === "all" ? "" : sessionType,
        status: sessionStatus === "all" ? "" : sessionStatus,
      });

      if (result.ok) {
        setSessions(result.data?.sessions || []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedNode, fromDate, toDate, username, sessionType, sessionStatus]);

  // Auto-load on mount
  useEffect(() => {
    if (initialLoad) {
      handleSearch();
      setInitialLoad(false);
    }
  }, [initialLoad, handleSearch]);

  const handleExport = () => {
    const params = new URLSearchParams({
      node: selectedNode,
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
      ...(username && { user: username }),
      ...(sessionType && sessionType !== "all" && { type: sessionType }),
      ...(sessionStatus && sessionStatus !== "all" && { status: sessionStatus }),
    });
    window.open(`/api/export/user-sessions?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-panel rounded-2xl p-6">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg mb-6">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-info">Session Sources:</strong> This view combines VPN Gateway sessions and AAA sessions.
            VPN sessions require NetScaler Gateway license. If no sessions appear, verify the Gateway/AAA features are enabled on your appliance.
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-background/50 rounded-xl border border-border/50">
          <div className="grid gap-1.5">
            <Label htmlFor="sessFrom" className="text-xs text-muted-foreground">From</Label>
            <Input
              id="sessFrom"
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="form-input w-44"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sessTo" className="text-xs text-muted-foreground">To</Label>
            <Input
              id="sessTo"
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="form-input w-44"
            />
          </div>

          <div className="grid gap-1.5 flex-1 min-w-[200px]">
            <Label htmlFor="sessUser" className="text-xs text-muted-foreground">User</Label>
            <Input
              id="sessUser"
              type="text"
              placeholder="user@domain"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger className="form-select w-28">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="vpn">VPN</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="aaa">AAA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={sessionStatus} onValueChange={setSessionStatus}>
              <SelectTrigger className="form-select w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2 ml-auto">
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Duration</th>
                <th>IP</th>
                <th>Node</th>
                <th>Start Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  </td>
                </tr>
              ) : sessions.length > 0 ? (
                sessions.map((session, i) => (
                  <tr key={i}>
                    <td className="text-muted-foreground font-mono">{i + 1}</td>
                    <td className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {session.user}
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.type.toLowerCase() === 'vpn' 
                          ? 'bg-chart-4/15 text-chart-4 border border-chart-4/20'
                          : 'bg-info/15 text-info border border-info/20'
                      }`}>
                        {session.type}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="font-mono text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {session.duration}
                      </div>
                    </td>
                    <td className="font-mono text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" />
                        {session.ip || "N/A"}
                      </div>
                    </td>
                    <td className="text-muted-foreground capitalize">{session.node}</td>
                    <td className="font-mono text-xs text-muted-foreground">
                      {session.start || "N/A"}
                    </td>
                  </tr>
                ))
              ) : searched ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="w-8 h-8 opacity-50" />
                      <span>No sessions found</span>
                      <span className="text-xs">This could mean no active sessions exist, or VPN/AAA features are not licensed</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-50" />
                      <span>Set filters and click Search to view user sessions</span>
                    </div>
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
