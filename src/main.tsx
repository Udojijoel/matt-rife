import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateEnv, renderEnvErrorScreen } from "./lib/env";

const { ok, missing } = validateEnv();
if (!ok) {
  console.error("[env] Missing required environment variables:", missing);
  renderEnvErrorScreen(missing);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
