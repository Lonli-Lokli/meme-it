export default function LoadingView() {
  return (
    <div className="fixed inset-0">
      <div className="animate-pulse bg-background/50 rounded-sm shadow-sm p-4">
        <div className="bg-muted aspect-square" />
      </div>
    </div>
  );
}
