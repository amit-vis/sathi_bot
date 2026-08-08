export function Wordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  const sizeClass =
    size === "lg"
      ? "text-[clamp(40px,12vw,56px)]"
      : "text-[clamp(28px,8vw,34px)]";
  return (
    <h1
      className={`text-center font-medium tracking-tight text-ink ${sizeClass} [text-shadow:0_0_22px_rgba(124,92,252,0.75)]`}
    >
      Saathi
    </h1>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex min-h-[min(760px,90vh)] w-full max-w-[420px] flex-col">
        {children}
      </div>
    </main>
  );
}