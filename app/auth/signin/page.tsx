"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Bug } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bug className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">BugSense</CardTitle>
            <CardDescription className="text-base mt-2">
              Accedi per analizzare i tuoi repository GitHub
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Button
              className="w-full gap-2 h-12 text-base"
              size="lg"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <Github className="h-5 w-5" />
              Continua con GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Accedendo, accetti i nostri{" "}
              <a href="#" className="underline hover:text-primary">
                Termini di Servizio
              </a>{" "}
              e la{" "}
              <a href="#" className="underline hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
