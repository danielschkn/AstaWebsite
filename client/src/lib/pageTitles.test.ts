// client/src/lib/pageTitles.test.ts

import { describe, it, expect } from "vitest";
import { pageTitle } from "./pageTitles";

describe("pageTitle", () => {
  it("gives the home page the full site name", () => {
    expect(pageTitle("/")).toBe("AStA Remagen – Dein RheinAhrCampus");
  });

  it("prefixes known pages and ignores a trailing slash", () => {
    expect(pageTitle("/eventkalender")).toBe("Eventkalender · AStA Remagen");
    expect(pageTitle("/gremien/stupa/")).toBe("StuPa · AStA Remagen");
    expect(pageTitle("/app")).toBe("App · AStA Remagen");
  });

  it("groups all admin pages and falls back for unknown paths", () => {
    expect(pageTitle("/admin/events/new")).toBe("Admin · AStA Remagen");
    expect(pageTitle("/gibts-nicht")).toBe("Seite nicht gefunden · AStA Remagen");
  });
});
