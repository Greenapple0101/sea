import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/globals.css";
import "./styles/tabler-override.css";
import "./styles/xp-titlebar-override.css";
import "./styles/retro.css";

createRoot(document.getElementById("root")!).render(<App />);
  