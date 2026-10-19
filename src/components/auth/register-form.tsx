"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandHeartIcon, Loader2Icon, SyringeIcon, TriangleAlertIcon } from "lucide-react";

import { PasswordInput } from "@/components/shared/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";

const ROLE_OPTIONS = [
  {
    value: "DONOR",
    title: "I want to donate",
    description: "Get matched with patients who need your blood type.",
    icon: HandHeartIcon,
  },
  {
    value: "REQUESTER",
    title: "I need blood",
    description: "Post requests and find available donors nearby.",
    icon: SyringeIcon,
  },
] as const;

export function RegisterForm({ defaultRole = "DONOR" }: { defaultRole?: "DONOR" | "REQUESTER" }) {
  const { register: registerUser } = useAuth();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: defaultRole,
      password: "",
      confirmPassword: "",
    },
  });
  const { errors } = form.formState;

  const onSubmit = (values: RegisterValues) => {
    const { name, email, password, role, phone } = values;
    registerUser.mutate({ name, email, password, role, ...(phone && { phone }) });
  };

  // Backend validation errors arrive as "field: message" strings.
  const serverErrors =
    registerUser.error instanceof ApiError ? registerUser.error.errors : [];
  const busy = registerUser.isPending || registerUser.isSuccess;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
      {registerUser.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>{registerUser.error.message}</AlertTitle>
          {serverErrors.length > 0 && (
            <AlertDescription>
              <ul className="list-disc pl-4">
                {serverErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      <FieldGroup>
        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">How will you use BloodBridge?</FieldLegend>
              <RadioGroup
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                className="grid-cols-1 sm:grid-cols-2"
              >
                {ROLE_OPTIONS.map(({ value, title, description, icon: Icon }) => (
                  <FieldLabel key={value} htmlFor={`role-${value}`}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>
                          <Icon className="size-4 text-primary" aria-hidden />
                          {title}
                        </FieldTitle>
                        <FieldDescription>{description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value={value} id={`role-${value}`} />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Nadia Islam"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
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

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">
              Phone <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+8801XXXXXXXXX"
              aria-invalid={!!errors.phone}
              {...form.register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat password"
              aria-invalid={!!errors.confirmPassword}
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </div>

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy && <Loader2Icon className="animate-spin" aria-hidden />}
          Create account
        </Button>
      </FieldGroup>
    </form>
  );
}
