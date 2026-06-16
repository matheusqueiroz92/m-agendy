import { cn } from "@/lib/utils";
import { Button } from "./button";
import Link from "next/link";

const BG_COLOR_CLASSES = {
    cta: "bg-cta hover:bg-cta/80",
    "cta-secondary": "bg-cta-secondary hover:bg-cta-secondary/80",
} as const;

type BgColor = keyof typeof BG_COLOR_CLASSES;

interface CtaButtonProps
    extends React.ComponentProps<typeof Button> {
    href?: string;
    className?: string;
    bgColor?: BgColor;
}

export function CtaButton({ children, href, className, asChild, bgColor = "cta", ...props }: CtaButtonProps) {
    const buttonClassName = cn(
        "relative h-11 cursor-pointer px-6 text-sm font-semibold text-cta-foreground sm:px-8 sm:text-base",
        BG_COLOR_CLASSES[bgColor],
        className
    );

    const content = href ? (
        <Button asChild className={buttonClassName} {...props}>
            <Link href={href}>{children}</Link>
        </Button>
    ) : (
        <Button className={buttonClassName} asChild={asChild} {...props}>
            {children}
        </Button>
    );

    return ( content );
}