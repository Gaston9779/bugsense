import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, Trash2 } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci il tuo profilo e le preferenze dell&apos;applicazione
        </p>
      </div>

      <div className="space-y-6">
        {/* Profilo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profilo
            </CardTitle>
            <CardDescription>
              Informazioni del tuo account GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                <AvatarFallback className="text-2xl">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{session.user?.name}</h3>
                <p className="text-sm text-muted-foreground">{session.user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                defaultValue={session.user?.name || ""}
                placeholder="Il tuo nome"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Le informazioni del profilo sono sincronizzate con GitHub
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferenze Analisi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferenze Analisi
            </CardTitle>
            <CardDescription>
              Configura come BugSense analizza i tuoi repository
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Focus Analisi</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue="balanced"
              >
                <option value="quality">Qualità del Codice</option>
                <option value="stability">Stabilità</option>
                <option value="performance">Performance</option>
                <option value="balanced">Bilanciato</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Determina il tipo di insights che verranno generati
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Soglia Risk Score</label>
              <Input
                type="number"
                defaultValue="10"
                min="1"
                max="100"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                File con risk score superiore a questa soglia verranno evidenziati
              </p>
            </div>

            <Button>Salva Preferenze</Button>
          </CardContent>
        </Card>

        {/* Privacy & Sicurezza */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Sicurezza
            </CardTitle>
            <CardDescription>
              Gestisci i tuoi dati e la privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Dati Raccolti</h4>
              <p className="text-sm text-muted-foreground">
                BugSense raccoglie solo i dati necessari per l&apos;analisi dei repository.
                Non condividiamo i tuoi dati con terze parti.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">GitHub Permissions</h4>
              <p className="text-sm text-muted-foreground">
                Accesso in lettura ai repository pubblici e privati per l&apos;analisi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Zona Pericolo */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Zona Pericolo
            </CardTitle>
            <CardDescription>
              Azioni irreversibili sul tuo account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Elimina tutti i dati</h4>
              <p className="text-sm text-muted-foreground">
                Elimina permanentemente tutti i repository analizzati, insights e dati associati
              </p>
              <Button variant="destructive" className="mt-2">
                Elimina Tutti i Dati
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium">Elimina Account</h4>
              <p className="text-sm text-muted-foreground">
                Elimina permanentemente il tuo account BugSense e tutti i dati associati
              </p>
              <Button variant="destructive" className="mt-2">
                Elimina Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
