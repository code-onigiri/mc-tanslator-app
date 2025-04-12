import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Edit from "./page/edit.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Edit />
  </StrictMode>,
);
