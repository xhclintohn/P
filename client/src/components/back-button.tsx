import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  label?: string;
}

export function BackButton({ to, label = "Back" }: BackButtonProps) {
  const [, setLocation] = useLocation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (to) {
          setLocation(to);
        } else {
          window.history.back();
        }
      }}
      className="gap-1.5 text-muted-foreground"
      data-testid="button-back"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
