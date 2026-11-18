// client/src/lib/pageTitles.ts
//
// Browser-tab / Google title per route, e.g. "Eventkalender · AStA Remagen".
// One central list instead of a title in every page component, so a new
// page only needs one line here. Layout applies it on every navigation.

const SITE = "AStA Remagen";

/** Exact paths → page name. */
const TITLES: Record<string, string> = {
  "/gremien": "Gremien",
  "/gremien/asta": "AStA",
  "/gremien/stupa": "StuPa",
  "/gremien/fachschaften": "Fachschaften",
  "/eventkalender": "Eventkalender",
  "/baracke": "BaRACke",
  "/sport": "Sport",
  "/ersti": "Ersti-Info",
  "/kontakt": "Kontakt",
  "/barrierefreiheit": "Barrierefreiheit",
  "/impressum": "Impressum",
  "/datenschutz": "Datenschutz",
  "/app": "App",
  "/login": "Login",
  "/signup": "Registrieren",
  "/profile": "Mein Profil",
};

/** Full document title for a pathname (trailing slash ignored). */
export function pageTitle(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (path === "/") return `${SITE} – Dein RheinAhrCampus`;
  if (path === "/admin" || path.startsWith("/admin/")) return `Admin · ${SITE}`;

  const name = TITLES[path];
  return name ? `${name} · ${SITE}` : `Seite nicht gefunden · ${SITE}`;
}
