import { Skeleton } from '@/components/ui/skeleton'

export default function LogsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map((g) => (
          <div key={g}>
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
