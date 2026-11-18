// client/src/pages/AppInstall.tsx
//
// /app — "AStA Remagen als App": what the app offers, how to install it on
// iPhone and Android (the visitor's own device listed first and marked),
// the notification switch, and short FAQs. Good target for a QR code on
// posters: asta-rac.com/app.
//
// The "app" is this website installed as a PWA (see src/sw.ts and
// lib/pwa.ts) — free, no app store.

import type { ReactNode } from "react";
import {
  BellRing,
  CircleCheck,
  CircleHelp,
  Download,
  EllipsisVertical,
  Share,
  Smartphone,
  SquarePlus,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import PushToggle from "@/components/PushToggle";
import { useInstallPrompt } from "@/lib/pwa";

const BENEFITS: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Smartphone,
    title: "Ein Tipp entfernt",
    text: "Startet vom Home-Bildschirm wie jede andere App – ohne Browser-Leiste.",
  },
  {
    Icon: WifiOff,
    title: "Auch offline",
    text: "Events, Ersti-Infos und Seiten, die du schon geöffnet hast, bleiben ohne Internet lesbar.",
  },
  {
    Icon: BellRing,
    title: "Neue Events sofort",
    text: "Auf Wunsch bekommst du eine Benachrichtigung, sobald ein neues Event eingetragen ist.",
  },
];

const IOS_STEPS: ReactNode[] = [
  <>Öffne <strong>asta-rac.com</strong> in Safari.</>,
  <>
    Tippe unten auf <strong>Teilen</strong>{" "}
    <Share className="inline h-4 w-4 align-text-bottom text-asta-red" aria-label="(Teilen-Symbol)" />.
  </>,
  <>
    Wähle <strong>„Zum Home-Bildschirm“</strong>{" "}
    <SquarePlus className="inline h-4 w-4 align-text-bottom text-asta-red" aria-hidden="true" />{" "}
    (eventuell etwas nach unten scrollen).
  </>,
  <>Tippe oben rechts auf <strong>„Hinzufügen“</strong>.</>,
];

const ANDROID_STEPS: ReactNode[] = [
  <>Öffne <strong>asta-rac.com</strong> in Chrome oder Samsung Internet.</>,
  <>
    Tippe auf <strong>„App installieren“</strong> – oder im Menü{" "}
    <EllipsisVertical className="inline h-4 w-4 align-text-bottom text-asta-red" aria-label="(Menü-Symbol)" />{" "}
    auf <strong>„App installieren“</strong> bzw. <strong>„Zum Startbildschirm hinzufügen“</strong>.
  </>,
  <>Bestätige mit <strong>„Installieren“</strong>.</>,
];

const FAQ: [string, string][] = [
  ["Kostet die App etwas?", "Nein. Sie ist kostenlos und kommt ganz ohne App Store aus."],
  ["Brauche ich ein Konto?", "Nein. Ein Konto brauchen nur die Editor:innen des AStA zum Pflegen der Inhalte."],
  [
    "Ist die App immer aktuell?",
    "Ja. Sie lädt die Inhalte live von asta-rac.com. Gibt es eine neue Version, erscheint unten der Hinweis „Aktualisieren“.",
  ],
  [
    "Wie entferne ich die App wieder?",
    "Wie jede andere App: Icon lange gedrückt halten und „Entfernen“ bzw. „App löschen“ wählen.",
  ],
];

function StepsCard({
  title,
  steps,
  mine,
}: {
  title: string;
  steps: ReactNode[];
  mine: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${
        mine ? "border-asta-red shadow-sm" : "border-gray-200"
      }`}
    >
      <h3 className="flex items-center gap-2 text-lg font-bold">
        {title}
        {mine && (
          <span className="rounded-full bg-asta-red/10 px-2 py-0.5 text-xs font-semibold text-asta-red">
            Dein Gerät
          </span>
        )}
      </h3>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-asta-red text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 text-gray-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AppInstall() {
  const { canPrompt, standalone, ios, promptInstall } = useInstallPrompt();

  const iosCard = <StepsCard key="ios" title="iPhone & iPad" steps={IOS_STEPS} mine={ios} />;
  const androidCard = (
    <StepsCard key="android" title="Android" steps={ANDROID_STEPS} mine={!ios} />
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-asta-red text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 flex flex-col gap-6 md:flex-row md:items-center">
          <img
            src="/pwa-512x512.png"
            alt=""
            aria-hidden="true"
            className="h-20 w-20 md:h-28 md:w-28 rounded-[22%] shadow-lg ring-4 ring-white/20"
          />
          <div>
            <h1 className="text-3xl md:text-5xl font-bold">AStA Remagen als App</h1>
            <p className="mt-2 max-w-xl text-lg text-white/90">
              Kostenlos und ohne App Store – direkt von asta-rac.com auf deinen
              Home-Bildschirm.
            </p>
            {standalone ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 font-medium">
                <CircleCheck className="h-5 w-5" aria-hidden="true" />
                Du nutzt die App bereits
              </p>
            ) : (
              canPrompt && (
                <button
                  type="button"
                  onClick={() => void promptInstall()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-asta-red shadow hover:bg-white/90 cursor-pointer"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Jetzt installieren
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* What you get */}
      <Band>
        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map(({ Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:block">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-asta-red/10 text-asta-red">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold sm:mt-3">{title}</h2>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Band>

      {/* How to install — the visitor's own platform first. */}
      {!standalone && (
        <Band id="installieren" alt>
          <SectionHeader icon={Download} title="So installierst du die App" />
          <div className="grid gap-4 md:grid-cols-2">
            {ios ? [iosCard, androidCard] : [androidCard, iosCard]}
          </div>
        </Band>
      )}

      {/* Notifications */}
      <Band id="benachrichtigungen">
        <SectionHeader
          icon={BellRing}
          title="Benachrichtigungen"
          subtitle="Wir schicken nur dann eine Nachricht, wenn ein neues Event eingetragen wird – keine Werbung. Ausschalten kannst du sie jederzeit hier oder in den Einstellungen deines Handys."
        />
        <div className="max-w-md">
          <PushToggle full />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Auf dem iPhone funktionieren Benachrichtigungen nur in der
          installierten App (ab iOS 16.4).
        </p>
      </Band>

      {/* FAQ */}
      <Band alt>
        <SectionHeader icon={CircleHelp} title="Häufige Fragen" />
        <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1 text-gray-600">{a}</dd>
            </div>
          ))}
        </dl>
      </Band>
    </div>
  );
}
