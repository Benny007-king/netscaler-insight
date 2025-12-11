import { useState, useCallback } from "react";
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
import { fetchFailoverHistory, FailoverEvent } from "@/lib/api";
import { Download, Search, Clock, AlertCircle, Info } from "lucide-react";

interface FailoverTabProps {
  selectedNode: string;
}

export function FailoverTab({ selectedNode }: FailoverTabProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [eventType, setEventType] = useState("all");
  const [events, setEvents] = useState<FailoverEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const result = await fetchFailoverHistory({
        node: selectedNode,
        from: fromDate,
        to: toDate,
        type: eventType === "all" ? "" : eventType,
      });

      if (result.ok) {
        setEvents(result.data?.events || []);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch failover history:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedNode, fromDate, toDate, eventType]);

  const handleExport = () => {
    const params = new URLSearchParams({
      node: selectedNode,
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
      ...(eventType && eventType !== "all" && { type: eventType }),
    });
    window.open(`/api/export/failover-history?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-panel rounded-2xl p-6">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg mb-6">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-info">Note:</strong> NetScaler API provides the last known HA state transition.
            For complete historical failover events, configure syslog forwarding to an external log management system.
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-background/50 rounded-xl border border-border/50">
          <div className="grid gap-1.5">
            <Label htmlFor="failFrom" className="text-xs text-muted-foreground">From</Label>
            <Input
              id="failFrom"
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="form-input w-44"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="failTo" className="text-xs text-muted-foreground">To</Label>
            <Input
              id="failTo"
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="form-input w-44"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="form-select w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="role-change">Role Change</SelectItem>
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
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Reason</th>
                <th>Role Change</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((event, i) => (
                  <tr key={i}>
                    <td className="text-muted-foreground font-mono">{i + 1}</td>
                    <td className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatDate(event.timestamp)}
                      </div>
                    </td>
                    <td>
                      <span className="badge-info text-xs px-2 py-1 rounded">
                        {event.type}
                      </span>
                    </td>
                    <td className="text-muted-foreground max-w-xs truncate">
                      {event.reason}
                    </td>
                    <td className="font-medium">{event.role_change}</td>
                  </tr>
                ))
              ) : searched ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <span>No failover events found</span>
                      <span className="text-xs">Try adjusting your search filters or check syslog for complete history</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-50" />
                      <span>Set filters and click Search to view failover history</span>
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
