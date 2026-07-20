import React from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./app.jsx";

registerSW({ immediate: true });
createRoot(document.getElementById("root")).render(<App />);
