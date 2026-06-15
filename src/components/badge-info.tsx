import { Badge } from "./ui/badge";

export function BadgeInfo({ title, icon, className }: { title: string, icon: React.ReactNode, className?: string }) {
    return (
        <Badge
            variant="outline"
            className={`border-cta/25 bg-cta/8 text-cta px-2.5 py-1 text-xs font-medium tracking-wide sm:px-3 sm:text-sm ${className}`}
        >
            {title}
            {icon}
        </Badge>
    );
}