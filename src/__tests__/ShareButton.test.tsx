// TESTING WITH A MOCKED BROWSER API: jsdom (our fake browser for tests)
// doesn't implement navigator.clipboard or navigator.share at all — real
// browsers restrict them for privacy/security reasons, and jsdom doesn't
// bother faking them. So for THIS test, we install our own fake versions
// before rendering, check that our component called them correctly, then
// remove our fakes afterwards so they don't leak into other test files.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShareButton from "@/components/ShareButton";

describe("ShareButton", () => {
  // "vi.fn()" creates a mock function — a fake we can inspect afterwards
  // to see how many times it was called and with what arguments, without
  // it actually doing anything real (like really touching the clipboard).
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeTextMock.mockClear();
    // "navigator.share" is deliberately left UNDEFINED here, so the
    // component's `"share" in navigator` check fails and it falls through
    // to the clipboard branch — this test is specifically checking THAT
    // fallback path, matching most desktop browsers' real behavior.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true, // lets afterEach clean this up again below
    });
  });

  afterEach(() => {
    // Remove our fake so it doesn't affect any other test file that runs
    // after this one — each test file should start from a clean slate.
    // @ts-expect-error - deleting a property TypeScript normally requires
    delete navigator.clipboard;
  });

  it("copies the current page URL to the clipboard when clicked", async () => {
    render(<ShareButton title="Test Movie" />);
    const button = screen.getByRole("button", { name: /share/i });

    fireEvent.click(button);

    // The click handler is async (it awaits navigator.clipboard.writeText),
    // so "waitFor" retries the check inside it until it passes or times
    // out — this is how you test code that doesn't finish instantly.
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
    });
  });

  it("shows 'Copied!' feedback after a successful copy", async () => {
    render(<ShareButton title="Test Movie" />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    // Once the copy succeeds, the button's own visible text should change
    // from "Share" to "Copied!" — findByText waits for this to appear,
    // since the state update happens asynchronously after the click.
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });
});
