import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { DesignProvider } from "./context/DesignContext";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DesignProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
            <NavBar />
            <main className="flex-1">
              <Router />
            </main>
            <Toaster />
          </div>
        </DesignProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
