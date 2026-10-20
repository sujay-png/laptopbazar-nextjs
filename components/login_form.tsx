"use client";

import { useState } from "react";
import { login } from "@/app/action/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <section className="w-full  min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 right-0 overflow-hidden md:block hidden">
        {/* Outer big circle */}
        <div className="absolute right-0 top-0 h-[650px] w-[650px] translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10" />
        {/* Inner circle */}
      </div>

      <div className="py-10 md:py-20 max-w-lg px-4 sm:px-0 mx-auto w-full">
        <Card className="max-w-lg px-6 py-8 sm:p-12 relative gap-6">
          <CardHeader className="text-center gap-6 p-0">
            <div className="mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full overflow-hidden border bg-background shadow-sm">
                <img src="/Logo.png" alt="Laptopbazzar Logo" className="h-full w-full object-contain p-1" />
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <CardTitle className="text-2xl font-semibold tracking-tight text-card-foreground">
                Welcome
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-normal">
                Login to your account now
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-6">
                {error && (
                  <div className="text-sm font-medium text-destructive text-center">
                    {error}
                  </div>
                )}

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-sm text-muted-foreground bg-transparent">
                  <span className="px-4">sign in with</span>
                </FieldSeparator>

                <div className="flex flex-col gap-4">
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="email"
                      className="text-sm text-muted-foreground font-normal"
                    >
                      Email*
                    </FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@laptopbazzar.com"
                      required
                      className="dark:bg-background h-9 shadow-xs"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm text-muted-foreground font-normal"
                    >
                      Password*
                    </FieldLabel>

                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="dark:bg-background h-9 shadow-xs"
                    />
                  </Field>
                </div>


                <Field className="gap-4">
                  <Button type="submit" size={"lg"} disabled={pending} className="rounded-lg h-10 hover:bg-primary/80 cursor-pointer">
                    {pending ? "Signing in..." : "Sign in"}
                  </Button>

                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
