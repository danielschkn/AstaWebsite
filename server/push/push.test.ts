// server/push/push.test.ts
//
// Pure checks (no database): which push addresses are accepted, and what a
// "new event" notification says. Safe to run locally.

import { describe, expect, it } from "vitest";
import { isAllowedPushEndpoint, PushSubscribeInput } from "./schemas.js";
import { buildNewEventPayload } from "./payload.js";

const P256DH = Buffer.alloc(65, 4).toString("base64url");
const AUTH = Buffer.alloc(16, 7).toString("base64url");

describe("isAllowedPushEndpoint", () => {
  it("accepts the real browser push services over HTTPS", () => {
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(isAllowedPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/x")).toBe(true);
    expect(isAllowedPushEndpoint("https://web.push.apple.com/QGx")).toBe(true);
    expect(isAllowedPushEndpoint("https://wns2-db5p.notify.windows.com/w/?token=1")).toBe(true);
  });

  it("rejects anything else (protects the server from calling arbitrary URLs)", () => {
    expect(isAllowedPushEndpoint("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(isAllowedPushEndpoint("https://localhost:5000/api/admin")).toBe(false);
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com.evil.example/x")).toBe(false);
    expect(isAllowedPushEndpoint("not a url")).toBe(false);
  });
});

describe("PushSubscribeInput", () => {
  it("accepts a well-formed browser subscription", () => {
    const parsed = PushSubscribeInput.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: P256DH, auth: AUTH },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects keys of the wrong length", () => {
    const parsed = PushSubscribeInput.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: "short", auth: AUTH },
    });
    expect(parsed.success).toBe(false);
  });
});

describe("buildNewEventPayload", () => {
  it("names the event, shows German local time and links to it", () => {
    const payload = buildNewEventPayload({
      id: "ev 1",
      title: "Oktoberfest",
      place: "BaRACke",
      // 18:00 UTC = 20:00 in Germany (summer time).
      startsAt: new Date("2026-10-22T18:00:00Z"),
    });
    expect(payload.title).toBe("Neues Event: Oktoberfest");
    expect(payload.body).toBe("Do., 22.10. · 20:00 Uhr · BaRACke");
    expect(payload.url).toBe("/eventkalender?event=ev%201");
    expect(payload.tag).toBe("event-ev 1");
  });
});
