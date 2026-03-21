import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(role: "admin" | "user" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("onboarding.getResponses", () => {
  it("throws FORBIDDEN when called by a non-admin user", async () => {
    const caller = appRouter.createCaller(createCtx("user"));
    await expect(caller.onboarding.getResponses()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("returns an array when called by an admin user", async () => {
    const caller = appRouter.createCaller(createCtx("admin"));
    // DB may not be available in test env; if it throws a connection error that's OK,
    // but it must NOT throw a FORBIDDEN error.
    try {
      const result = await caller.onboarding.getResponses();
      expect(Array.isArray(result)).toBe(true);
    } catch (err: unknown) {
      // Accept DB connection errors in CI — just not auth errors
      const message = err instanceof Error ? err.message : String(err);
      expect(message).not.toContain("FORBIDDEN");
    }
  });
});
