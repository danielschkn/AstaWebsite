// server/push.api.test.ts
//
// HTTP routes for push subscriptions. Uses the database — runs in CI against
// the throwaway Postgres (see .github/workflows/ci.yml). Do NOT run locally:
// server/.env points at the live database.
//
// Test rows use endpoints starting with TEST_ENDPOINT and are removed in
// afterAll.

import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";

const TEST_ENDPOINT = "https://fcm.googleapis.com/fcm/send/test-push-";
const P256DH = Buffer.alloc(65, 4).toString("base64url");
const AUTH = Buffer.alloc(16, 7).toString("base64url");

afterAll(async () => {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint: { startsWith: TEST_ENDPOINT } },
  });
  await prisma.$disconnect();
});

describe("GET /api/push/public-key", () => {
  it("answers 503 when no VAPID keys are configured (as in CI)", async () => {
    const res = await request(app).get("/api/push/public-key");
    expect(res.status).toBe(503);
  });
});

describe("POST /api/push/subscribe", () => {
  it("rejects an endpoint that isn't a browser push service", async () => {
    const res = await request(app)
      .post("/api/push/subscribe")
      .send({ endpoint: "https://evil.example/hook", keys: { p256dh: P256DH, auth: AUTH } });
    expect(res.status).toBe(400);
  });

  it("stores a subscription once, even when sent twice", async () => {
    const endpoint = `${TEST_ENDPOINT}${Date.now()}`;
    const body = { endpoint, keys: { p256dh: P256DH, auth: AUTH } };

    expect((await request(app).post("/api/push/subscribe").send(body)).status).toBe(201);
    expect((await request(app).post("/api/push/subscribe").send(body)).status).toBe(201);

    expect(await prisma.pushSubscription.count({ where: { endpoint } })).toBe(1);
  });
});

describe("POST /api/push/unsubscribe", () => {
  it("removes the subscription", async () => {
    const endpoint = `${TEST_ENDPOINT}unsub-${Date.now()}`;
    await prisma.pushSubscription.create({ data: { endpoint, p256dh: P256DH, auth: AUTH } });

    const res = await request(app).post("/api/push/unsubscribe").send({ endpoint });

    expect(res.status).toBe(204);
    expect(await prisma.pushSubscription.count({ where: { endpoint } })).toBe(0);
  });
});
