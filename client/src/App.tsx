import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import Home from "@/pages/home";
import Docs from "@/pages/docs";
import Status from "@/pages/status";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function useTrackVisitor() {
  useEffect(() => {
    let visitorId = localStorage.getItem("toxic_visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("toxic_visitor_id", visitorId);
    }
    fetch("/api/visitors/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, page: window.location.pathname }),
    }).catch(() => {});
  }, []);
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/docs" component={Docs} />
      <Route path="/status" component={Status} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useTrackVisitor();
  return (
    <>
      <Navbar />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
