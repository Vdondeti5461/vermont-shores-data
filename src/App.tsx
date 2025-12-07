import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Network from "./pages/Network";
import Analytics from "./pages/Analytics";
import RealTime from "./pages/analytics/RealTime";
import SnowAnalyticsPage from "./pages/analytics/SnowAnalytics";
import DataDownload from "./pages/DataDownload";
import Research from "./pages/Research";
import Gallery from "./pages/research/Gallery";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";

import APIDocumentation from "./pages/APIDocumentation";
import NotFound from "./pages/NotFound";
import BulkRequest from "./pages/BulkRequest";
import Auth from "./pages/Auth";
import APIKeys from "./pages/APIKeys";
import LiveData from "./pages/LiveData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/network" element={<Network />} />
          
          {/* Analytics Routes */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/realtime" element={<RealTime />} />
          <Route path="/analytics/seasonal" element={<SnowAnalyticsPage />} />
          <Route path="/analytics/snow" element={<SnowAnalyticsPage />} />
          <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
          
          {/* Data Download Routes */}
          <Route path="/download" element={<DataDownload />} />
          <Route path="/download/bulk-request" element={<BulkRequest />} />
          <Route path="/data-download" element={<DataDownload />} />
          <Route path="/live-data" element={<LiveData />} />
          
          {/* Research Routes */}
          <Route path="/research" element={<Research />} />
          <Route path="/research/gallery" element={<Gallery />} />
          
          {/* Documentation Routes */}
          <Route path="/documentation" element={<APIDocumentation />} />
          <Route path="/documentation/api" element={<APIDocumentation />} />
          
          {/* Authentication Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/api-keys" element={<APIKeys />} />
          
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
