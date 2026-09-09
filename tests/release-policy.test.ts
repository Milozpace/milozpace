import { describe, expect, test } from "vitest";

import { scanForbiddenText } from "@/lib/release-policy";

describe("public release boundary", () => {
  test("rejects production service and private workspace references", () => {
    expect(scanForbiddenText("sample.ts", "connect to cloudbase at runtime")).toContain("production service reference");
    expect(scanForbiddenText("sample.ts", "C:\\Users\\person\\private.txt")).toContain("absolute Windows user path");
    expect(scanForbiddenText("sample.ts", "BOKU_OWNER_PASSWORD=secret")).toContain("private credential variable");
  });

  test("allows the Milozpace project name and local demo content", () => {
    expect(scanForbiddenText("README.md", "Milozpace 使用 /demo/morning.svg。"))
      .toEqual([]);
  });
});
