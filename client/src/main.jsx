import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { StockPriceProvider } from "./context/StockPriceContext"; // Import the new provider
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      {/* StockPriceProvider needs to be inside AuthProvider but outside PortfolioProvider */}
      <StockPriceProvider>
        <PortfolioProvider>
          <App />
        </PortfolioProvider>
      </StockPriceProvider>
    </AuthProvider>
  </React.StrictMode>
);
