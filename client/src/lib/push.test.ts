// client/src/lib/push.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";
import { detectPushState, urlBase64ToUint8Array } from "./push";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("urlBase64ToUint8Array", () => {
  it("decodes URL-safe base64 without padding", () => {
    // "-_8" is URL-safe base64 for the bytes 0xFB 0xFF ("+/8=" in normal base64).
    expect(Array.from(urlBase64ToUint8Array("-_8"))).toEqual([0xfb, 0xff]);
    expect(Array.from(urlBase64ToUint8Array("AQID"))).toEqual([1, 2, 3]);
  });
});

describe("detectPushState", () => {
  it("is 'unsupported' in a browser without push (jsdom)", async () => {
    expect(await detectPushState()).toBe("unsupported");
  });

  it("asks iPhone users in Safari to install the app first", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE_UA);
    expect(await detectPushState()).toBe("needs-install");
  });
});
