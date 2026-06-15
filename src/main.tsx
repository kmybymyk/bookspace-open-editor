import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/gowun-batang/400.css";
import "@fontsource/gowun-dodum/400.css";
import "@fontsource/noto-sans-kr/korean-400.css";
import "@fontsource/noto-serif-kr/korean-400.css";
import { App } from "./App";
import { initEditorAnalytics } from "./analytics";
import "./styles.css";

const rootElement = document.getElementById("root");

if (rootElement !== null) {
  initEditorAnalytics();
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
