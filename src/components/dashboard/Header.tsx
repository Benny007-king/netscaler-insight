import { RefreshCw, LogOut, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  selectedNode: string;
  onNodeChange: (node: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function Header({ selectedNode, onNodeChange, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between sticky top-4 z-50 animate-fade-in">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center shadow-lg glow-primary">
          <Server className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            NetScaler Dashboard
          </h1>
          <p className="text-xs text-primary font-mono">Live Monitoring</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-xl border border-border/50">
        <label className="text-sm text-muted-foreground pl-2">Node:</label>
        <Select value={selectedNode} onValueChange={onNodeChange}>
          <SelectTrigger className="w-32 bg-secondary border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="default"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.location.href = '/logout'}
          className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
