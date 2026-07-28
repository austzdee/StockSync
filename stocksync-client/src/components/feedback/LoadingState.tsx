interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({
  message = "Loading...",
}: LoadingStateProps) => {
  return (
    <div
      className="flex items-center gap-3 p-6 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
        aria-hidden="true"
      />

      <span>{message}</span>
    </div>
  );
};

export default LoadingState;