import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3007";
const authCookie = process.env.TEST_AUTH_COOKIE;
const studyA = process.env.TEST_STUDY_A;
const studyB = process.env.TEST_STUDY_B;

test(
  "study comparison loads in under 5 seconds",
  { timeout: 10_000 },
  async () => {
    const query = new URLSearchParams();
    if (studyA) query.set("studyA", studyA);
    if (studyB) query.set("studyB", studyB);

    const url = `${baseUrl}/reports/study-comparison${query.size > 0 ? `?${query}` : ""}`;
    const startedAt = performance.now();
    const response = await fetch(url, {
      headers: authCookie ? { cookie: authCookie } : undefined,
      redirect: "manual",
    });
    const elapsedMs = performance.now() - startedAt;

    assert.equal(
      response.status,
      200,
      `Expected an authenticated comparison page response. Received HTTP ${response.status}. ` +
        "Set TEST_AUTH_COOKIE to an authenticated browser cookie.",
    );
    assert.ok(
      elapsedMs < 5_000,
      `Study comparison took ${elapsedMs.toFixed(0)}ms; expected less than 5000ms.`,
    );
  },
);
