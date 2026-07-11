import Link from "next/link";
import { Brain } from "lucide-react";

import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          <h1 className="text-xl font-semibold">Sign in to Amygdala</h1>
          <p className="text-sm text-muted-foreground">Your AI business operations hub</p>
        </div>

        <LoginForm callbackUrl={callbackUrl ?? "/dashboard"} />

        <p className="text-center text-xs text-muted-foreground">
          Demo login — <span className="font-medium">admin@acme.co</span> /{" "}
          <span className="font-medium">password123</span>
        </p>

        <p className="text-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
