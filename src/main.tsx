
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { startPlatform } from "./core/bootstrap/startPlatform";

import "./styles/globals.css";

startPlatform();
createRoot(document.getElementById("root")!).render(
  <App />
);