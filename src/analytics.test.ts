import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initEditorAnalytics, trackEditorEvent } from "./analytics";

describe("editor analytics", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/en/editor/");
    document.documentElement.lang = "en";
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.bookspaceTrack = undefined;
  });

  afterEach(() => {
    window.bookspaceTrack = undefined;
    window.gtag = undefined;
    window.dataLayer = undefined;
  });

  it("sends editor context without user content when tracking an event", () => {
    const track = vi.fn();
    window.bookspaceTrack = track;

    trackEditorEvent("editor_action_click", { action: "export_epub" });

    expect(track).toHaveBeenCalledWith("editor_action_click", {
      action: "export_epub",
      app_surface: "editor",
      editor_locale: "en",
      editor_path: "/en/editor/",
    });
  });

  it("tracks delegated click events from analytics attributes", () => {
    initEditorAnalytics();
    const track = vi.fn();
    window.bookspaceTrack = track;
    const button = document.createElement("button");
    button.dataset["analyticsEvent"] = "editor_action_click";
    button.dataset["analyticsParamAction"] = "save_project";
    document.body.append(button);

    button.click();

    expect(track).toHaveBeenCalledWith("editor_action_click", {
      action: "save_project",
      app_surface: "editor",
      editor_locale: "en",
      editor_path: "/en/editor/",
    });
    button.remove();
  });
});
