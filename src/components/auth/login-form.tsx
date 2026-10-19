"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HandHeartIcon,
  Loader2Icon,
  ShieldCheckIcon,
  SyringeIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import type { Role } from "@/types";

const ROLE_ICONS: Record<Role, typeof ShieldCheckIcon> = {
  ADMIN: ShieldCheckIcon,
  DONOR: HandHeartIcon,
  REQUESTER: SyringeIcon,
};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { login } = useAuth({ redirectTo });
  const [demoRole, setDemoRole] = useState<Role | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = (values: LoginValues) => {
    setDemoRole(null);
    login.mutate(values);
  };

  const demoLogin = (role: Role) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    setDemoRole(role);
    form.reset({ email: account.email, password: account.password });
    login.mutate({ email: account.email, password: account.password });
  };

  const busy = login.isPending || login.isSuccess;

  return (
    <div className="space-y-6">
      <section aria-labelledby="demo-login-heading" className="space-y-3">
        <div>
          <h2 id="demo-login-heading" className="text-sm font-semibold">
            One-click demo login
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore the platform as any of the three roles.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map(({ role, label, description }) => {
            const Icon = ROLE_ICONS[role];
            const loading = busy && demoRole === role;
            return (
              <Button
                key={role}
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => demoLogin(role)}
                aria-label={`Log in as demo ${label}`}
                className="h-auto flex-col items-start gap-1 p-3 text-left whitespace-normal sm:items-center sm:text-center"
              >
                <span className="flex items-center gap-2 font-semibold">
                  {loading ? (
                    <Loader2Icon className="animate-spin" aria-hidden />
                  ) : (
                    <Icon className="text-primary" aria-hidden />
                  )}
                  {label}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {description}
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      <FieldSeparator className="my-0">or log in with email</FieldSeparator>

      {login.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Login failed</AlertTitle>
          <AlertDescription>{login.error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy && !demoRole && <Loader2Icon className="animate-spin" aria-hidden />}
            Log in
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
