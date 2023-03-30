import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TargetsProvider } from "./context/TargetsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TargetsProvider>
      <App />
    </TargetsProvider>
  </React.StrictMode>
);
