import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/* ── Shared mock setup ── */

// Mock the database so tests don't require a live DB connection
vi.mock("../drizzle/schema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../drizzle/schema")>();
  return { ...actual };
});

// Mock getDb to return a fake db object
vi.mock("./_core/db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onDuplicateKeyUpdate: vi.fn().mockReturnValue({
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
  }),
}));

// Mock notifyOwner to avoid real HTTP calls
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("waitlist.join", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success:true for a valid email and source", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.waitlist.join({
      email: "test@example.com",
      source: "home_header",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts an optional name field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.waitlist.join({
      email: "founder@startup.io",
      name: "Alex",
      source: "footer",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts all valid source values", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const sources = ["header", "footer", "home_header", "home_footer", "home_modal"] as const;

    for (const source of sources) {
      const result = await caller.waitlist.join({
        email: `test+${source}@example.com`,
        source,
      });
      expect(result).toEqual({ success: true });
    }
  });

  it("rejects an invalid email address", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.waitlist.join({
        email: "not-an-email",
        source: "header",
      })
    ).rejects.toThrow();
  });

  it("rejects an invalid source value", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.waitlist.join({
        email: "valid@example.com",
        // @ts-expect-error intentionally invalid source
        source: "invalid_source",
      })
    ).rejects.toThrow();
  });

  it("rejects a name longer than 200 characters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.waitlist.join({
        email: "valid@example.com",
        name: "A".repeat(201),
        source: "header",
      })
    ).rejects.toThrow();
  });
});
