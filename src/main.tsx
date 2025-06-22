import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Edit from "./page/edit.tsx";
import { useSettingsStore } from "./component/stores/SettingsStore.ts";

// 設定の初期化
useSettingsStore.getState().initializeSettings();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Edit />
  </StrictMode>,
);
