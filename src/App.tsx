import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Network from "./pages/Network";
import Analytics from "./pages/Analytics";
import DataDownload from "./pages/DataDownload";
import Research from "./pages/Research";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Documentation from "./pages/Documentation";
import APIDocumentation from "./pages/APIDocumentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/network" element={<Network />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/realtime" element={<Analytics />} />
          <Route path="/analytics/historical" element={<Analytics />} />
          <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
          <Route path="/analytics/quality" element={<Analytics />} />
          <Route path="/analytics/climate/*" element={<Analytics />} />
          <Route path="/analytics/hydrology/*" element={<Analytics />} />
          <Route path="/analytics/air-quality" element={<Analytics />} />
          <Route path="/analytics/soil" element={<Analytics />} />
          <Route path="/download" element={<DataDownload />} />
          <Route path="/download/browse" element={<DataDownload />} />
          <Route path="/download/api" element={<DataDownload />} />
          <Route path="/download/bulk" element={<DataDownload />} />
          <Route path="/download/feeds" element={<DataDownload />} />
          <Route path="/research" element={<Research />} />
          <Route path="/documentation" element={<APIDocumentation />} />
          <Route path="/documentation/api" element={<APIDocumentation />} />
          <Route path="/documentation/feeds" element={<Documentation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
