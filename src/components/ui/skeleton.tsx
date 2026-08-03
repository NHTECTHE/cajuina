import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex-1 p-4 flex flex-col gap-3 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 w-full border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="hidden md:flex flex-col gap-2 flex-1 items-end">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export { Skeleton, TableSkeleton }
