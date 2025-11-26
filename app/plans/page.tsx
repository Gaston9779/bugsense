"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Star, Rocket } from "lucide-react";

export default function PlansPage() {
  const plans = [
    {
      name: "Free Tier",
      price: "€0",
      period: "sempre",
      description: "Perfetto per iniziare e scoprire il valore di BugSense",
      icon: Star,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      features: [
        { text: "2 repository analizzate", included: true },
        { text: "5 analisi al giorno", included: true },
        { text: "Heatmap directory", included: true },
        { text: "Risk score + insights", included: true },
        { text: "Commit activity basic", included: true },
        { text: "Coupling limitato (top 3)", included: true },
        { text: "Trend storico", included: false },
        { text: "Coupling completo", included: false },
        { text: "Repository private", included: false },
        { text: "Analisi automatiche", included: false },
      ],
      cta: "Inizia Gratis",
      highlight: false,
    },
    {
      name: "Premium Standard",
      price: "€9",
      period: "al mese",
      description: "Ideale per developer individuali e indie hacker",
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary",
      features: [
        { text: "10 repository", included: true },
        { text: "Analisi illimitate", included: true },
        { text: "Repository private", included: true },
        { text: "Risk timeline (storico)", included: true },
        { text: "Coupling completo", included: true },
        { text: "Commit patterns avanzati", included: true },
        { text: "Generazione PDF / report", included: true },
        { text: "Esportazione dati", included: true },
        { text: "Priorità nelle job queue", included: true },
        { text: "Notifiche email settimanali", included: true },
      ],
      cta: "Scegli Premium",
      highlight: true,
    },
    {
      name: "Pro",
      price: "€24",
      period: "al mese",
      description: "Per freelance e team piccoli che vogliono il massimo",
      icon: Rocket,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      features: [
        { text: "30 repository", included: true },
        { text: "Analisi pianificate (cron)", included: true },
        { text: "Alert webhook (Slack/Discord)", included: true },
        { text: "Branch comparison", included: true },
        { text: "API access (API Key)", included: true },
        { text: "Retention analisi 6 mesi", included: true },
        { text: "2 seat inclusi (team)", included: true },
        { text: "Supporto prioritario", included: true },
        { text: "Custom integrations", included: true },
        { text: "White-label reports", included: true },
      ],
      cta: "Scegli Pro",
      highlight: false,
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Scegli il Piano Perfetto per Te
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Inizia gratis e scopri come BugSense può migliorare la qualità del tuo codice.
          Passa a Premium quando sei pronto per funzionalità avanzate.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative ${plan.highlight ? "border-2 shadow-xl scale-105" : "border-2"} ${plan.borderColor} ${plan.bgColor} transition-all hover:shadow-2xl`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1 text-sm font-semibold">
                    🔥 Più Popolare
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className={`mx-auto mb-4 p-3 rounded-full ${plan.bgColor} w-fit`}>
                  <Icon className={`h-8 w-8 ${plan.color}`} />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base mb-4">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-5xl font-bold ${plan.color}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.highlight
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "bg-background hover:bg-muted border-2"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Note */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-xl">💡 Domande Frequenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Posso cambiare piano in qualsiasi momento?</p>
              <p className="text-muted-foreground">
                Sì, puoi fare upgrade o downgrade in qualsiasi momento. Il cambio sarà effettivo immediatamente.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Come funziona il Free Tier?</p>
              <p className="text-muted-foreground">
                Il piano gratuito è perfetto per provare BugSense senza impegno. Puoi analizzare fino a 2 repository
                con 5 analisi al giorno, accedendo alle funzionalità base come risk score, insights e heatmap.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Cosa succede se supero i limiti del mio piano?</p>
              <p className="text-muted-foreground">
                Riceverai una notifica e potrai scegliere se fare upgrade o attendere il reset mensile dei limiti.
                I tuoi dati rimarranno sempre accessibili.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Offrite sconti per studenti o open source?</p>
              <p className="text-muted-foreground">
                Sì! Contattaci a <a href="mailto:support@bugsense.dev" className="text-primary underline">support@bugsense.dev</a> per
                richiedere uno sconto dedicato.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
