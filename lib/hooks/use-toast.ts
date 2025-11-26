/**
 * Hook personalizzato per toast notifications
 * Per ora è un placeholder - in futuro integreremo sonner o react-hot-toast
 */

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, type = "info", duration = 3000 }: ToastOptions) => {
    // TODO: Implementare con una libreria di toast
    console.log(`[${type.toUpperCase()}] ${title ? title + ": " : ""}${description}`);
    
    // Per ora mostra un alert in development
    if (process.env.NODE_ENV === "development") {
      const message = title ? `${title}\n${description}` : description;
      // Non usiamo alert in produzione, solo log
    }
  };

  return {
    toast,
    success: (description: string, title?: string) =>
      toast({ description, title, type: "success" }),
    error: (description: string, title?: string) =>
      toast({ description, title, type: "error" }),
    info: (description: string, title?: string) =>
      toast({ description, title, type: "info" }),
    warning: (description: string, title?: string) =>
      toast({ description, title, type: "warning" }),
  };
}
