import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Edit from "./page/edit.tsx";
import { useSettingsStore } from "./component/stores/SettingsStore.ts";
import { useEditorSettingsStore } from "./component/stores/EditorSettingsStore.ts";

// 設定の初期化
useSettingsStore.getState().initializeSettings();
useEditorSettingsStore.getState().initializeEditorSettings();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Edit />
  </StrictMode>,
);
