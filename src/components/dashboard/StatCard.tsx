import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  className?: string;
  color?: "primary" | "info" | "success" | "warning";
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  className,
  color = "primary",
}: StatCardProps) {
  const colorClasses = {
    primary: "text-primary",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className={cn("stat-card", className)}>
      <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3">
        {title}
      </h3>
      {icon && <div className="mb-3">{icon}</div>}
      <div className={cn("text-3xl font-bold font-mono", colorClasses[color])}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
