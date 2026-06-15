import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

afterEach(() => {
  vi.clearAllMocks();
});
