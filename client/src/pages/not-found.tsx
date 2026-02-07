import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-not-found">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
