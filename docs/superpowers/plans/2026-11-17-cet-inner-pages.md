# CET Inner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the inner pages of the `cet-v2` frontend (news list, article detail, Ban lãnh đạo, faculty/department) match the CET template pages `news.html`, `details.html`, `ban-giam-hieu.html`, `khoa-dao-tao.html`, filled with real Portal API data.

**Architecture:** Parallel components under `src/features/cet`, switched on by `isCetTheme()` (`process.env.FRONTEND_THEME === "cet-v2"`) at the top of each existing page. Old components are untouched. Each page gets a small `get…Data` function in `src/features/cet/services` that re-calls the Portal API (agreed with the user: repeating API calls is fine). Pure logic lives in alias-free `.ts` utils so `node --test` can run it; components are checked with `tsc`, `next build` and the browser.

**Tech Stack:** Next.js 16 (read `node_modules/next/dist/docs/` before writing page code), next-intl, CSS Modules, `node --test` on `.ts` files (Node 24 type stripping, same as `tests/cet-links.test.mjs`).

**Spec:** `docs/features/test-v2.md` (existing scope and deploy notes) plus the design agreed in chat on 2026-11-17: approach A (parallel components behind the flag), real data only, gradient fallback when an article has no thumbnail. Pages without a CET sample (Đào tạo, Giới thiệu, Lịch tuần, Nhân sự, Tư vấn tuyển sinh) are out of scope here and stay as they are; the user decides on them after reviewing this work.

## Global Constraints

- Branch `feature/test-v2-cet`. Do not commit, push or deploy unless the user asks. Never add `Co-Authored-By` or any Claude attribution to a commit.
- Without `FRONTEND_THEME=cet-v2` every page must render exactly as before.
- No template placeholder content (`[Học vị. Họ và tên]`, sample news, fake view counts). Show a field only when the API returns it; staff email/phone are not in the overview payload, so cards omit them.
- Colours come from the existing CSS variables on `.site` (`--cet`, `--cet-dark`, `--cet-soft`, `--cet-line`, `--cet-ink`, `--cet-muted`, `--cet-gold`) so the theme picker keeps working. No hard-coded burgundy.
- All internal links go through `CetLink` (`src/features/cet/components/CetLink.tsx`) with `href` like `/tin-tuc/<slug>`; it localises for `en`.
- Touch targets at least 44px, focus ring inherited from `.site`, WCAG AA contrast, layout works at 320 / 768 / 1024 / 1440 px.
- Keep each existing page's `generateMetadata`, JSON-LD and `notFound()`/`redirect` behaviour.

## Review Focus

- Active category is a child that is not a top-level pill: list still filters, and that category appears as an active pill (Task 1 test).
- Search or filter with no results, or API returns `null`: page shows an empty/unavailable state with a "clear filter" link, no crash (Task 2).
- Article with no cover, no excerpt, no `author.full_name`, or very wide images/tables in content: no layout overflow at 320px (Task 3 browser check).
- Staff with no avatar, no `position_name`, HTML in `biography`: initials placeholder, no empty heading, HTML stripped or sanitised (Tasks 4–5).
- `locale=en`: links resolve to localised routes and sections use English labels (Tasks 2–5 browser check).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/features/cet/utils/theme.ts` (new) | `isCetTheme()` |
| `src/features/cet/utils/inner.ts` (new, no aliases) | pure helpers: category pills, pagination numbers, leader grouping, faculty section list, initials |
| `src/features/cet/cet-inner.module.css` (new) | styles for title band, two-column layout, cards, pills, sidebar cards, staff cards |
| `src/features/cet/components/CetPageHeader.tsx` (new) | red title band with breadcrumb and `h1` |
| `src/features/cet/components/CetSideCard.tsx` (new) | titled sidebar card |
| `src/features/cet/components/CetNewsList.tsx`, `CetArticleDetail.tsx`, `CetLeadership.tsx`, `CetFaculty.tsx` (new) | page bodies |
| `src/features/cet/services/news-data.ts`, `article-data.ts`, `department-data.ts` (new) | API glue per page |
| `src/app/[locale]/(public)/tin-tuc/page.tsx`, `tin-tuc/[slug]/page.tsx`, `bo-mon/[slug]/page.tsx`, `khoa/[slug]/page.tsx` (modify) | add the `isCetTheme()` branch |
| `tests/cet-inner.test.mjs` (new) | unit tests for `inner.ts` |
| `docs/features/test-v2.md` (modify) | list the converted pages |

---

### Task 1: Flag, pure helpers, shared shell

**Files:**
- Create: `src/features/cet/utils/theme.ts`, `src/features/cet/utils/inner.ts`, `src/features/cet/cet-inner.module.css`, `src/features/cet/components/CetPageHeader.tsx`, `src/features/cet/components/CetSideCard.tsx`, `tests/cet-inner.test.mjs`

**Interfaces:**
- Produces:
  - `isCetTheme(): boolean`
  - `type CategoryNode = { slug: string; name: string; is_visible: boolean; article_count: number; children?: CategoryNode[] }`
  - `type CategoryPill = { slug: string; name: string }`
  - `CET_HIDDEN_CATEGORY_SLUGS: string[]` = `["lich-tuan","weekly-calendar","gioi-thieu","lich-su-phat-trien","chuc-nang-nhiem-vu"]`
  - `buildCategoryPills(tree: CategoryNode[], activeSlug: string, max?: number): CategoryPill[]` (default `max` 7)
  - `pageNumbers(current: number, total: number): Array<number | "…">`
  - `groupLeaders<T extends { position_name?: string | null }>(staffs: T[], isEn: boolean): Array<{ label: string; items: T[] }>`
  - `facultySections(counts: { description: boolean; programs: number; articles: number; staffs: number }, isEn: boolean): Array<{ id: string; label: string }>`
  - `initials(name: string): string`
  - `<CetPageHeader title: string; crumbs: Array<{ label: string; href?: string }>; locale: string; hideTitle?: boolean />`
  - `<CetSideCard title: string; children: ReactNode />`

- [ ] **Step 1: Write failing tests in `tests/cet-inner.test.mjs`** importing `../src/features/cet/utils/inner.ts`:
  - `buildCategoryPills` drops `is_visible:false`, `article_count:0` and `CET_HIDDEN_CATEGORY_SLUGS`, keeps tree order, caps at `max`.
  - `buildCategoryPills(tree, "child-slug")` where `child-slug` is a child of a top-level node returns the pills plus `{slug:"child-slug", name}` as the last pill.
  - `pageNumbers(1,1)` → `[1]`; `pageNumbers(5,10)` → `[1,"…",4,5,6,"…",10]`; `pageNumbers(2,4)` → `[1,2,3,4]`.
  - `groupLeaders` puts "Hiệu trưởng" before "Phó Hiệu trưởng" before others, and `"Phó Hiệu trưởng, phụ trách Trường"` and `"Vice Rector"` land in the deputy group; labels are Vietnamese or English per `isEn`.
  - `facultySections({description:true,programs:0,articles:3,staffs:8}, false)` → ids `["gioi-thieu","tin-tuc","can-bo"]` with Vietnamese labels; all-empty → `[]`.
  - `initials("Hoàng Hữu Việt")` → `"HV"`; `initials("")` → `""`.
- [ ] **Step 2: Run** `node --test tests/cet-inner.test.mjs` — expect FAIL (module not found).
- [ ] **Step 3: Implement `inner.ts`** (no `@/` imports). Port the accent-stripping `normalize` and the rector/deputy regexes from `src/features/department/components/LeadershipGroups.tsx` into `groupLeaders`; then change `LeadershipGroups.tsx` to import `groupLeaders`'s helper so the logic is not duplicated and old behaviour is unchanged (export the group-order function from `inner.ts` as `leaderGroup(position, isEn): { order: number; label: string }`).
- [ ] **Step 4: Run tests** — expect PASS, plus `node --test tests/*.test.mjs` still green.
- [ ] **Step 5: Implement `theme.ts`, `cet-inner.module.css`, `CetPageHeader`, `CetSideCard`.** Title band mirrors CET: `linear-gradient(110deg, var(--cet-dark), var(--cet) 60%, var(--cet-light))`, emblem watermark `/images/cet-emblem.png` at opacity 0.09 as in `.hero`, breadcrumb "Trang chủ / …" in small white text, `h1` 1.9rem white. CSS classes to define now so later tasks reuse them: `pageBand`, `crumbs`, `layout` (grid `minmax(0,1fr) 320px`, one column under 992px), `sideCard`, `sideTitle` (colour `--cet`, 1.15rem, 600), `sideList`, `pill`, `pillActive`, `emptyState`.
- [ ] **Step 6: Run** `pnpm exec tsc --noEmit` — no errors.

### Task 2: News list (`/vi/tim-kiem`)

**Files:**
- Create: `src/features/cet/services/news-data.ts`, `src/features/cet/components/CetNewsList.tsx`
- Modify: `src/app/[locale]/(public)/tin-tuc/page.tsx` (return `<CetNewsList>` right after `setRequestLocale` when `isCetTheme()`; keep `generateMetadata`)

**Interfaces:**
- Consumes: Task 1 exports; `articleService.getLatestArticles`, `categoryService.getCategoryTree`.
- Produces:
  - `type CetNewsFilters = { q: string; category: string; tag: string; page: number }`
  - `getCetNewsData(filters: CetNewsFilters): Promise<CetNewsData>` where `CetNewsData = { articles: PortalArticleListResponse[]; page: number; totalPages: number; totalItems: number; pills: CategoryPill[]; popular: PortalArticleListResponse[]; filters: CetNewsFilters; unavailable: boolean }`. Page size 10; excludes `CET_HIDDEN_CATEGORY_SLUGS` only when no category is selected (same rule as the old page); `popular` = 5 items with `sortBy: "view_count", sortDir: "desc"`; `unavailable` true when the article call returns `null`.
  - `<CetNewsList data: CetNewsData; locale: string />`

- [ ] **Step 1: Implement `news-data.ts`** with the three calls in one `Promise.all`; pills from `buildCategoryPills(tree, filters.category)`.
- [ ] **Step 2: Implement `CetNewsList`** as a server component: `CetPageHeader` (title "Tin tức & sự kiện", or `Kết quả tìm kiếm cho "q"` when `q` is set, crumbs Trang chủ / Tin tức); left column: pill row ("Tất cả" + pills, links to `/tin-tuc?category_slug=…`, `aria-current` on active) then a 2-column card grid reusing the home news card look (`thumbnail` 16/10 with `SafeImage`; when `thumbnail_object_key` is empty show a gradient block with a `Newspaper` icon, as in CET), category tag, title link, 3-line excerpt, date; numbered pagination from `pageNumbers` preserving `q`, `category_slug`, `tag_slug`; right column: `CetSideCard` "Đọc nhiều" (title links, divider list) and "Liên kết nhanh" (Lịch tuần, Văn bản – Biểu mẫu → `/tin-tuc?category_slug=van-ban-bieu-mau`, Học bổng → `thong-tin-hoc-bong`). Empty/unavailable state uses `emptyState` with a link back to `/tin-tuc`.
- [ ] **Step 3: Wire the branch in `tin-tuc/page.tsx`** (`const data = await getCetNewsData({...})`).
- [ ] **Step 4: Verify** `pnpm exec tsc --noEmit`, then in the browser (Task 6 setup) open `/vi/tim-kiem`, `?category_slug=thong-bao`, `?q=zzzzzz`, `?page=2` and `/en/search`.

### Task 3: Article detail (`/vi/<slug>`)

**Files:**
- Create: `src/features/cet/services/article-data.ts`, `src/features/cet/components/CetArticleDetail.tsx`
- Modify: `src/app/[locale]/(public)/tin-tuc/[slug]/page.tsx`

**Interfaces:**
- Consumes: Task 1 exports; `sanitizeRichHtml`, `getLocalizedField`, `formatDate`.
- Produces:
  - `getCetRelatedArticles(categorySlug: string, excludeId: string): Promise<PortalArticleListResponse[]>` (4 items from `getArticlesByCategory(categorySlug, 1, 5)` minus the current article)
  - `<CetArticleDetail article: PortalArticleDetail; related: PortalArticleListResponse[]; cleanHtml: string; locale: string; shareUrl: string />`

- [ ] **Step 1: Implement `article-data.ts`.**
- [ ] **Step 2: Implement `CetArticleDetail`:** `CetPageHeader` with `hideTitle` and crumbs Trang chủ / Tin tức / Chi tiết tin; main column: category pill, `h1` (2rem, 700), meta row (date, author `full_name || username`, `view_count` + "lượt xem"), cover image with 16/9 ratio only when `cover_url` exists, excerpt, content in `<div className="rich-text-content">` (class from `src/styles/rich-text.css`) with `overflow-wrap:anywhere` and `max-width:100%` on images/tables, tags as pills linking `/tin-tuc?tag=<slug>`, "Chia sẻ:" links to Facebook sharer (`https://www.facebook.com/sharer/sharer.php?u=` + encoded `shareUrl`) and `mailto:`; sidebar `CetSideCard` "Tin liên quan" (hidden when empty).
- [ ] **Step 3: Wire the branch in `tin-tuc/[slug]/page.tsx`** after `jsonLd` and `breadcrumbSchema` are built, so both `<script type="application/ld+json">` blocks are still emitted; make the two sidebar promises (lines 69–79) run only when `!isCetTheme()`. `shareUrl` = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/${slug}`.
- [ ] **Step 4: Verify** `tsc`, then open a real article and one with a long table/wide image at 320px; check JSON-LD scripts still present via `document.querySelectorAll('script[type="application/ld+json"]').length`.

### Task 4: Ban lãnh đạo (`/vi/bo-mon/ban-lanh-dao-vien`)

**Files:**
- Create: `src/features/cet/services/department-data.ts`, `src/features/cet/components/CetLeadership.tsx`
- Modify: `src/app/[locale]/(public)/bo-mon/[slug]/page.tsx` (after the existing `faculty` redirect, when `isCetTheme()` and `isLeadershipUnit(department.slug)` return `<CetLeadership>`; keep the JSON-LD scripts; Task 5 adds the non-leadership branch)

**Interfaces:**
- Consumes: `groupLeaders`, `initials`, `DepartmentOverview`, `programService.getAll`, `departmentService.getDepartments`.
- Produces:
  - `type CetFacultySummary = { slug: string; name: string; programCount: number; staffCount: number }`
  - `getCetFacultySummaries(locale: string): Promise<CetFacultySummary[]>` (faculties from `getDepartments({ unit_type: "faculty", lang })`; `programCount` = published, active programs grouped by `department_id`)
  - `<CetLeadership overview: DepartmentOverview; faculties: CetFacultySummary[]; locale: string />`

- [ ] **Step 1: Implement `department-data.ts`.**
- [ ] **Step 2: Implement `CetLeadership`:** `CetPageHeader` title "Cơ cấu tổ chức", crumbs Trang chủ / Cơ cấu tổ chức; `sectionTitle`-style heading "Ban Giám hiệu" (reuse `.sectionTitle` from `cet.module.css`); 2-column grid of cards, each with a circular 96px avatar (`SafeImage` of `avatar_object_key`, else `initials` on `--cet-soft`), name prefixed by `academic_title`/`degree` when present, position in `--cet` bold small text, and "Nhiệm vụ" showing `biography` stripped of HTML only when non-empty; group headings from `groupLeaders` only when more than one group exists; below, heading "Các khoa" with cards linking `/khoa/<slug>` showing `"{programCount} ngành đào tạo · Xem đội ngũ cán bộ"` (omit the count part when 0).
- [ ] **Step 2b: Contact block** — keep the unit's `office`/`phone`/`email` as a small card under the grid when present (the old page showed them).
- [ ] **Step 3: Wire the branch**, then verify `tsc` and the page in the browser (vi and en).

### Task 5: Faculty and department pages (`/vi/khoa/<slug>`, `/vi/bo-mon/<slug>`)

**Files:**
- Create: `src/features/cet/components/CetFaculty.tsx`
- Modify: `src/app/[locale]/(public)/khoa/[slug]/page.tsx`; `bo-mon/[slug]/page.tsx` (branch from Task 4)

**Interfaces:**
- Consumes: `facultySections`, `initials`, `DepartmentOverview`, `sanitizeRichHtml`.
- Produces: `<CetFaculty overview: DepartmentOverview; locale: string />`

- [ ] **Step 1: Implement `CetFaculty`:** `CetPageHeader` title = `department.name`, crumbs Trang chủ / Cơ cấu tổ chức / name; right-hand `CetSideCard` titled with the unit name containing in-page anchor links from `facultySections({ description: !!description, programs: programs.length, articles: latest_articles.length, staffs: staffs.length }, isEn)`, plus a contact card when `office/phone/email` exist. Sections in the main column, each with the red-underline `sectionTitle`: "Giới thiệu" (`description`/`short_description` through `sanitizeRichHtml` in `.rich-text-content`; mission and vision as sub-blocks when present), "Chương trình đào tạo" (links `/dao-tao/dai-hoc/<slug>`), "Tin tức" (3 compact news cards from `latest_articles`), "Đội ngũ cán bộ" (horizontal staff cards like CET: portrait left, name with title/degree, position in `--cet`, links to `/nhan-su/<slug>`). Section `id`s must equal those returned by `facultySections`.
- [ ] **Step 2: Wire the branches** in `khoa/[slug]/page.tsx` and, for non-leadership units when `isCetTheme()`, in `bo-mon/[slug]/page.tsx`.
- [ ] **Step 3: Verify** `tsc`; open one faculty with 8 staff and one unit without programs (`/vi/khoa/khoa-tu-dong-hoa` has none): the "Chương trình đào tạo" link and section must be absent.

### Task 6: Full verification and docs

**Files:**
- Modify: `docs/features/test-v2.md`

- [ ] **Step 1: Local run against the test API.** In `.env.local` (git-ignored) set `FRONTEND_THEME=cet-v2`, `NEXT_PUBLIC_API_URL=https://test-api-ktcn.itup.io.vn`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`; start via `preview_start` (add a `cet-v2-dev` entry to `.claude/launch.json` running `pnpm dev`). If `next/image` rejects the media host, set `IMAGE_ALLOW_LOCAL_IP=true` only locally.
- [ ] **Step 2: Run** `node --test tests/*.test.mjs`, `pnpm exec tsc --noEmit`, `pnpm exec eslint src/features/cet`, `pnpm build` — all must pass.
- [ ] **Step 3: Browser pass** on the five page types at 320 / 768 / 1024 / 1440 px in `vi` and `en`: no horizontal scroll, no console errors, side-by-side compare with the matching CET page; screenshots of each.
- [ ] **Step 4: Regression check:** restart without `FRONTEND_THEME` and confirm `/vi/tim-kiem`, an article and `/vi/khoa/khoa-tu-dong-hoa` render the old design.
- [ ] **Step 5: Update `docs/features/test-v2.md`** "Giao diện và dữ liệu" with the four converted page types and the note that Đào tạo, Giới thiệu, Lịch tuần, Nhân sự and Tư vấn tuyển sinh still use the old content.
