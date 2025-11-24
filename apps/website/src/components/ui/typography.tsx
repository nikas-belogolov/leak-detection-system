import { cn } from "~/lib/utils";

export function H1({ children, className }: React.ComponentProps<'h1'>) {
    return (
        <h1 className={cn(className, "scroll-m-20 text-4xl font-extrabold tracking-tight text-wrap")}>{children}</h1>
    )
}

export function H2({ children, className }: React.ComponentProps<'h2'>) {
    return (
        <h2 className={cn(className, "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight")}>{children}</h2>
    )
}