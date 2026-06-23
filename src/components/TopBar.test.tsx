import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { appCopy } from "../i18n";
import { TopBar } from "./TopBar";

const noop = vi.fn();

describe("TopBar", () => {
  it("links the Korean editor brand back to the site home", () => {
    render(
      <TopBar
        copy={appCopy.ko.topBar}
        title="테스트 책"
        actionNotice=""
        epubDisabledReason="아직 내보낼 수 없습니다."
        epubReady={false}
        locale="ko"
        savedAt="방금"
        onLocaleChange={noop}
        onSaveProject={noop}
        onOpenProject={noop}
        onImportEpub={noop}
        onImportMarkdown={noop}
        onExportEpub={noop}
      />,
    );

    expect(screen.getByRole("link", { name: "BookSpace 홈으로" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "BookSpace Web GitHub 소스 보기" })).toHaveAttribute(
      "href",
      "https://github.com/kmybymyk/bookspace-open-editor",
    );
  });

  it("links the English editor brand back to the English site home", () => {
    render(
      <TopBar
        copy={appCopy.en.topBar}
        title="Test book"
        actionNotice=""
        epubDisabledReason="EPUB is not ready yet."
        epubReady={false}
        locale="en"
        savedAt="now"
        onLocaleChange={noop}
        onSaveProject={noop}
        onOpenProject={noop}
        onImportEpub={noop}
        onImportMarkdown={noop}
        onExportEpub={noop}
      />,
    );

    expect(screen.getByRole("link", { name: "Back to BookSpace home" })).toHaveAttribute("href", "/en/");
    expect(screen.getByRole("link", { name: "View BookSpace Web source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/kmybymyk/bookspace-open-editor",
    );
  });
});
