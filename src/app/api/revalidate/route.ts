import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// Tags assigned to cached API fetches (see the *Service files). Everything else is covered by
// revalidating the root layout path below.
const CACHE_TAGS = [
  "articles",
  "categories",
  "site-settings",
  "documents",
  "departments",
  "staff-directory",
  "menu-header",
  "menu-footer",
  "menu-sidebar",
];

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.REVALIDATION_TOKEN;
  const given = request.headers.get("x-revalidation-token");
  if (!expected || !given) return false;
  return timingSafeEqual(digest(expected), digest(given));
}

/**
 * Called by the backend after an administrator changes content, so the public site shows the
 * change immediately instead of waiting for the `revalidate` window of each cached fetch.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  revalidatePath("/", "layout");
  for (const tag of CACHE_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
