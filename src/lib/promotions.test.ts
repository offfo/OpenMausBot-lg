import { beforeEach, expect, it, vi } from "vitest";
import { announcementHistory } from "@/lib/announcement-history";
import { GROK_MOVE_NOTICE, nextNotice, NOTICES, PROMOTION_NOTICES, type NoticeId } from "@/lib/notices";
import { PROMOTIONS } from "@/lib/promotions";

beforeEach(() => {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {} });
  vi.stubGlobal("sessionStorage", { getItem: () => null, setItem: () => {} });
});

const due = (ids: readonly NoticeId[]) => Object.fromEntries(NOTICES.map(id => [id, ids.includes(id)])) as Parameters<typeof nextNotice>[0];

it("is off in this build", () => {
  expect(PROMOTIONS).toBe(false);
});

it("the queue never picks a promotion, even when every one is due and unseen", () => {
  expect(nextNotice(due(PROMOTION_NOTICES), () => false)).toBeNull();
  expect(nextNotice(due(NOTICES), () => false)).toBe(GROK_MOVE_NOTICE);
});

it("a promotion still waiting on its answer does not hold the notices behind it", () => {
  const facts = { ...due([GROK_MOVE_NOTICE]), ...Object.fromEntries(PROMOTION_NOTICES.map(id => [id, null])) } as Parameters<typeof nextNotice>[0];
  expect(nextNotice(facts, () => false)).toBe(GROK_MOVE_NOTICE);
});

it("Announcements lists no promotion and no card from the remote file", () => {
  const everyone: Parameters<typeof announcementHistory>[0]["facts"] = { branded: false, organization: false, cloudSale: true, cloudCards: true, remote: false, team: false, canSave: true,
    sponsors: true, modelgo: true };
  const card = { id: "sponsor-card", kind: "sponsor", title: "Acme", body: "Buy" } as unknown as Parameters<typeof announcementHistory>[0]["cards"][number];
  const listed = announcementHistory({ facts: everyone, cards: [card], feedUpdatedAt: null, now: Date.parse("2026-11-20") }).map(item => item.id);
  expect(listed).toEqual([GROK_MOVE_NOTICE]);
});
