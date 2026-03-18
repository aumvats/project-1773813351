import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <p className="font-heading text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-accent px-5 py-2 text-sm font-heading font-semibold text-white hover:bg-accent/90 transition-colors duration-fast"
          >
            Go home
          </Link>
          <Link
            href="/screen"
            className="rounded-md border border-border-col px-5 py-2 text-sm font-heading font-semibold text-text-primary hover:bg-surface transition-colors duration-fast"
          >
            Start screening
          </Link>
        </div>
      </div>
    </div>
  );
}
