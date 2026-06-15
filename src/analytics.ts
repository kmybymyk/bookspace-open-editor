const GA_MEASUREMENT_ID = "G-B59YZDLFWX";

type AnalyticsPrimitive = string | number | boolean;
export type AnalyticsParams = Readonly<Record<string, AnalyticsPrimitive>>;

type GtagArguments =
  | readonly ["js", Date]
  | readonly ["config", string, AnalyticsParams?]
  | readonly ["event", string, AnalyticsParams?];

type Gtag = (...args: GtagArguments) => void;

declare global {
  interface Window {
    dataLayer?: GtagArguments[] | undefined;
    gtag?: Gtag | undefined;
    bookspaceTrack?: ((eventName: string, params?: AnalyticsParams) => void) | undefined;
  }
}

function currentLocale(): string {
  return document.documentElement.lang === "en" ? "en" : "ko";
}

function currentEditorPath(): string {
  return window.location.pathname === "/en/editor/" || window.location.pathname === "/en/editor" ? "/en/editor/" : "/editor/";
}

function baseParams(): AnalyticsParams {
  return {
    app_surface: "editor",
    editor_locale: currentLocale(),
    editor_path: currentEditorPath(),
  };
}

function paramsFromElement(element: Element): AnalyticsParams {
  const params: Record<string, AnalyticsPrimitive> = {};
  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith("data-analytics-param-")) {
      continue;
    }
    const key = attribute.name.replace("data-analytics-param-", "").replaceAll("-", "_");
    params[key] = attribute.value;
  }
  return params;
}

function trackElementEvent(element: Element): void {
  const eventName = element.getAttribute("data-analytics-event");
  if (eventName === null || eventName.trim() === "") {
    return;
  }
  trackEditorEvent(eventName, paramsFromElement(element));
}

function handleAnalyticsClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) {
    return;
  }
  const element = event.target.closest("[data-analytics-event]");
  if (element !== null) {
    trackElementEvent(element);
  }
}

function handleAnalyticsChange(event: Event): void {
  if (!(event.target instanceof HTMLSelectElement)) {
    return;
  }
  const eventName = event.target.getAttribute("data-analytics-change-event");
  if (eventName === null || eventName.trim() === "") {
    return;
  }
  trackEditorEvent(eventName, {
    ...paramsFromElement(event.target),
    target_value: event.target.value,
  });
}

function ensureGtag(): void {
  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;
  window.gtag = (...args: GtagArguments) => {
    dataLayer.push(args);
  };
}

export function trackEditorEvent(eventName: string, params: AnalyticsParams = {}): void {
  window.bookspaceTrack?.(eventName, {
    ...baseParams(),
    ...params,
  });
}

export function initEditorAnalytics(): void {
  ensureGtag();
  window.bookspaceTrack = (eventName, params = {}) => {
    window.gtag?.("event", eventName, params);
  };
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID, {
    page_path: currentEditorPath(),
    app_surface: "editor",
    editor_locale: currentLocale(),
  });
  trackEditorEvent("editor_open");
  document.addEventListener("click", handleAnalyticsClick);
  document.addEventListener("change", handleAnalyticsChange);
}
