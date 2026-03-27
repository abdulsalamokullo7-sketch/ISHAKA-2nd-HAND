export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-isha-muted border-t-isha-primary" />
        <p className="text-sm font-medium text-isha-text-muted">Loading&hellip;</p>
      </div>
    </div>
  );
}
