import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AppRoutes } from "./routes/AppRoutes";
import { AppProvider } from "./contexts/AppContext";
import { NotificationCenter } from "./components/common/NotificationCenter";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <AppRoutes />
          <Toaster />
          <NotificationCenter />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}