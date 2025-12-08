import { useState } from "react";
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
import { unlockUser } from "@/lib/api";
import { Unlock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function UnlockUserTab() {
  const [node, setNode] = useState("primary");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUnlock = async () => {
    if (!username.trim()) {
      setResult({ success: false, message: "Please enter a username" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await unlockUser(node, username.trim());
      
      if (response.ok && response.data?.success) {
        setResult({ success: true, message: response.data.message || "Account unlocked successfully" });
        setUsername("");
      } else {
        setResult({ 
          success: false, 
          message: response.data?.error || response.error || "Failed to unlock account" 
        });
      }
    } catch (error) {
      setResult({ success: false, message: "An error occurred while unlocking the account" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <div className="glass-panel rounded-2xl p-8 border-t-4 border-primary">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-4 shadow-lg glow-primary">
            <Unlock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Unlock User Account</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Unlock a locked AAA user account on the selected NetScaler node
          </p>
        </div>

        <div className="space-y-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-warning">Security Notice:</strong> This action will unlock a user account
              that was locked due to failed login attempts. Ensure you have verified the user's identity.
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unlockNode" className="text-muted-foreground">Node</Label>
              <Select value={node} onValueChange={setNode}>
                <SelectTrigger id="unlockNode" className="form-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="unlockUsername" className="text-muted-foreground">Username</Label>
              <Input
                id="unlockUsername"
                type="text"
                placeholder="e.g., jdoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                className="form-input"
              />
            </div>
          </div>

          <Button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-6 text-lg font-semibold"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 mr-2" />
                Unlock Account
              </>
            )}
          </Button>

          {/* Result Message */}
          {result && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                result.success
                  ? "bg-success/10 border border-success/20 text-success"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
