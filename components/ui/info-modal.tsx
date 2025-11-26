"use client";

import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  title: string;
  description: string;
  details: string[];
  interpretation?: {
    low: string;
    medium: string;
    high: string;
  };
}

export function InfoModal({ title, description, details, interpretation }: InfoModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Cosa misura */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              📊 Cosa misura
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Come interpretare */}
          {interpretation && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                🎯 Come interpretare i valori
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                  <span className="font-semibold text-green-700">🟢 Basso:</span>
                  <span className="text-green-700">{interpretation.low}</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                  <span className="font-semibold text-yellow-700">🟡 Medio:</span>
                  <span className="text-yellow-700">{interpretation.medium}</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
                  <span className="font-semibold text-red-700">🔴 Alto:</span>
                  <span className="text-red-700">{interpretation.high}</span>
                </div>
              </div>
            </div>
          )}

          {/* Perché è importante */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              💡 Perché è importante
            </h4>
            <p className="text-sm text-muted-foreground">
              Monitorare questa metrica ti aiuta a identificare aree critiche del codice che richiedono 
              attenzione immediata, prevenendo bug futuri e migliorando la manutenibilità del progetto.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
