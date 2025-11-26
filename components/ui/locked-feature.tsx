"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

interface LockedFeatureProps {
  title: string;
  description: string;
  requiredPlan: "premium" | "pro";
  children?: React.ReactNode;
  blur?: boolean;
}

export function LockedFeature({
  title,
  description,
  requiredPlan,
  children,
  blur = true,
}: LockedFeatureProps) {
  const planInfo = {
    premium: {
      name: "Premium Standard",
      price: "€9/mese",
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    pro: {
      name: "Pro",
      price: "€24/mese",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  };

  const plan = planInfo[requiredPlan];
  const Icon = plan.icon;

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/30">
      {/* Blurred content */}
      {children && blur && (
        <div className="absolute inset-0 z-0">
          <div className="blur-sm opacity-30 pointer-events-none">{children}</div>
        </div>
      )}

      {/* Lock overlay */}
      <div className="relative z-10 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto mb-4 p-4 rounded-full ${plan.bgColor} w-fit`}>
            <Lock className={`h-8 w-8 ${plan.color}`} />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-sm py-1 px-3">
              <Icon className={`h-4 w-4 mr-1 ${plan.color}`} />
              {plan.name}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="font-semibold">{plan.price}</span>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/plans">
                Sblocca con {plan.name}
                <Sparkles className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Accedi a questa funzionalità e molto altro
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/**
 * Inline locked badge for smaller UI elements
 */
export function LockedBadge({ requiredPlan }: { requiredPlan: "premium" | "pro" }) {
  const planName = requiredPlan === "premium" ? "Premium" : "Pro";

  return (
    <Badge variant="outline" className="gap-1 text-xs">
      <Lock className="h-3 w-3" />
      {planName}
    </Badge>
  );
}
