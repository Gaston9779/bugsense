"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Bug } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Errore di Configurazione",
      description: "GitHub OAuth non è configurato. Configura GITHUB_ID e GITHUB_SECRET nel file .env",
    },
    AccessDenied: {
      title: "Accesso Negato",
      description: "Hai negato l'accesso. Riprova e autorizza l'applicazione.",
    },
    Default: {
      title: "Errore di Autenticazione",
      description: "Si è verificato un errore. Riprova più tardi.",
    },
  };

  const errorInfo = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{errorInfo.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {errorInfo.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "Configuration" && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Per configurare GitHub OAuth:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Vai su github.com/settings/developers</li>
                <li>Crea OAuth App</li>
                <li>Callback: http://localhost:3000/api/auth/callback/github</li>
                <li>Copia ID e Secret in .env</li>
              </ol>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Torna alla Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
