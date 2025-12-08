import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const upperStatus = status.toUpperCase();
  
  const getVariant = () => {
    if (upperStatus.includes('UP') || upperStatus.includes('ENABLED') || upperStatus.includes('PRIMARY') || upperStatus.includes('ACTIVE')) {
      return 'badge-success';
    }
    if (upperStatus.includes('DOWN') || upperStatus.includes('DISABLED') || upperStatus.includes('TERMINATED')) {
      return 'badge-danger';
    }
    if (upperStatus.includes('WARN') || upperStatus.includes('SECONDARY') || upperStatus.includes('STANDBY')) {
      return 'badge-warning';
    }
    return 'badge-neutral';
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        getVariant(),
        className
      )}
    >
      {upperStatus}
    </span>
  );
}
