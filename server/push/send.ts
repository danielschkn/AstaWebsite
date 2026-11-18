// server/push/send.ts
//
// Sends a notification to every stored subscription.
//
// Keys (VAPID = "Voluntary Application Server Identification"): a key pair
// that proves to Google/Apple/Mozilla that a push really comes from us.
// Set on the server as environment variables:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  (generate: npx web-push generate-vapid-keys)
//   VAPID_SUBJECT                        (contact, e.g. mailto:rac-asta-vorsitz@rheinahrcampus.de)
// Without them, push is simply switched off (the website hides the button).
//
// Safety: local development uses the LIVE database, so a test event created
// on a laptop would notify real students. Pushes are therefore only sent
// when NODE_ENV=production (Render) — or locally with PUSH_SEND_IN_DEV=true.

import webpush from "web-push";
import type { PrismaClient } from "@prisma/client";
import type { PushPayload } from "./payload.js";

interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

function vapidConfig(): VapidConfig | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:rac-asta-vorsitz@rheinahrcampus.de";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

/** Public key for the browser, or null if push isn't configured. */
export function vapidPublicKey(): string | null {
  return vapidConfig()?.publicKey ?? null;
}

function sendingAllowed(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.PUSH_SEND_IN_DEV === "true"
  );
}

/**
 * Status codes meaning "this address will never work again": gone/unknown
 * (404, 410), malformed (400) or made for an old key pair (403).
 */
const DEAD_STATUS = new Set([400, 403, 404, 410]);

/** Send in batches so a big subscriber list doesn't open hundreds of connections at once. */
const BATCH_SIZE = 50;

export interface SendResult {
  sent: number;
  removed: number;
  failed: number;
  skipped?: "not-configured" | "dev";
}

export async function sendPushToAll(
  prisma: PrismaClient,
  payload: PushPayload,
): Promise<SendResult> {
  const config = vapidConfig();
  if (!config) return { sent: 0, removed: 0, failed: 0, skipped: "not-configured" };
  if (!sendingAllowed()) {
    console.info(`[push] not sent (dev mode): ${payload.title}`);
    return { sent: 0, removed: 0, failed: 0, skipped: "dev" };
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  const body = JSON.stringify(payload);
  const deadIds: string[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
    const batch = subscriptions.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          {
            vapidDetails: config,
            // Keep trying for a day if the phone is offline, then drop it.
            TTL: 24 * 60 * 60,
          },
        ),
      ),
    );
    results.forEach((result, j) => {
      if (result.status === "fulfilled") {
        sent++;
        return;
      }
      const status = (result.reason as { statusCode?: number }).statusCode;
      if (status !== undefined && DEAD_STATUS.has(status)) deadIds.push(batch[j].id);
      else failed++;
    });
  }

  if (deadIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: deadIds } } });
  }
  console.info(
    `[push] "${payload.title}": ${sent} sent, ${deadIds.length} removed, ${failed} failed`,
  );
  return { sent, removed: deadIds.length, failed };
}
