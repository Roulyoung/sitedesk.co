import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const createQueryClient = () => new QueryClient();

export const AppProviders = ({ children, client }: { children: React.ReactNode; client?: QueryClient }) => (
  <QueryClientProvider client={client ?? createQueryClient()}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
    </TooltipProvider>
  </QueryClientProvider>
);
