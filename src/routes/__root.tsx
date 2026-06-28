import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-3xl px-10 py-12 text-center max-w-md">
        <p className="text-sm tracking-[0.3em] text-muted-foreground">ERROR · 404</p>
        <h1 className="mt-3 text-5xl font-semibold nova-text">Lost in orbit</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for has drifted out of range.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full nova-gradient px-5 py-2.5 text-sm font-medium text-white"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-3xl px-10 py-12 text-center max-w-md">
        <h1 className="text-xl font-semibold">Something glitched in the matrix</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Unexpected error."}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full nova-gradient px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-4 py-2 text-sm hover-lift">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NOVA AI — Resume Architect" },
      { name: "description", content: "AI-powered career platform: ATS-friendly resumes, cover letters, interview coaching, and job tracking." },
      { name: "author", content: "NOVA AI" },
      { property: "og:title", content: "NOVA AI — Resume Architect" },
      { property: "og:description", content: "Build resumes that beat the bots. AI career coach, ATS scoring, mock interviews & more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <style>{`
          html, body { font-family: 'Inter', system-ui, sans-serif; }
          h1,h2,h3,h4,h5 { font-family: 'Space Grotesk', 'Inter', sans-serif; letter-spacing: -0.02em; }
        `}</style>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    // Keep React Query in sync with auth state
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
