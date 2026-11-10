import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterStaffs,
  getStaffQualifications,
} from "../src/features/lecturer/utils/staff-directory.ts";
import { addStaffDirectoryMenu } from "../src/features/menu/utils/add-staff-directory.ts";

const staffs = [
  {
    id: "an",
    full_name: "Đặng Hoài An",
    english_name: "Hoai An Dang",
    department_id: "it",
    research_interests: "<p>Trí tuệ nhân tạo; Học máy</p>",
  },
  {
    id: "binh",
    full_name: "Nguyễn Bình",
    department_id: "it",
    research_interests: "<p>An toàn thông tin</p>",
  },
  {
    id: "chi",
    full_name: "Lê Minh Chi",
    department_id: "ee",
    research_interests: "Tự động hóa; Trí tuệ nhân tạo",
  },
];

test("staff name search ignores Vietnamese accents, letter case and repeated spaces", () => {
  assert.deepEqual(
    filterStaffs(staffs, { q: "  DANG   hoai an " }).map((s) => s.id),
    ["an"],
  );
  assert.deepEqual(
    filterStaffs(staffs, { q: "Hoai An Dang" }).map((s) => s.id),
    ["an"],
  );
});

test("department, name and research filters combine without changing roster order or data", () => {
  const original = structuredClone(staffs);
  assert.deepEqual(
    filterStaffs(staffs, { department: "it", research: "tri tue nhan tao" }).map((s) => s.id),
    ["an"],
  );
  assert.deepEqual(filterStaffs(staffs, { department: "ee", q: "dang", research: "tri tue" }), []);
  assert.deepEqual(filterStaffs(staffs, {}), original);
  assert.deepEqual(staffs, original);
});

test("missing optional fields are supported and research search ignores HTML tags", () => {
  assert.deepEqual(filterStaffs([{ id: "empty", full_name: "Trần Nam" }], { research: "AI" }), []);
  assert.deepEqual(filterStaffs(staffs, { research: "<p>" }), []);
});

test("qualifications use readable abbreviations and tolerate missing values", () => {
  assert.equal(
    getStaffQualifications({ academic_title: "Phó giáo sư", degree: "Tiến sĩ" }, "vi"),
    "PGS. TS.",
  );
  assert.equal(
    getStaffQualifications({ academic_title: "Associate Professor", degree: "Doctorate" }, "en"),
    "Assoc. Prof. PhD",
  );
  assert.equal(getStaffQualifications({}, "vi"), "");
});

const about = {
  id: "about",
  menu_id: "header",
  title: "Giới thiệu",
  depth: 0,
  sort_order: 1,
  has_link: true,
  is_visible: true,
  open_in_new_tab: false,
  target_type: "MODULE",
  target_info: { title: "Giới thiệu", slug: "gioi-thieu" },
  children: [{ id: "history", title: "Lịch sử phát triển", children: [] }],
};

test("staff directory is added under About without mutating the API menu", () => {
  const original = structuredClone(about);
  const items = addStaffDirectoryMenu([about], "vi");
  assert.equal(items[0].children.length, 2);
  assert.equal(items[0].children[1].title, "Cán bộ");
  assert.equal(items[0].children[1].target_info.slug, "gioi-thieu/can-bo");
  assert.deepEqual(about, original);
  assert.deepEqual(addStaffDirectoryMenu(items, "vi"), items);
});

test("an API-configured staff directory link is not duplicated", () => {
  const configured = {
    ...about,
    children: [
      {
        id: "staff",
        title: "Cán bộ",
        target_type: "EXTERNAL_LINK",
        external_url: "/vi/gioi-thieu/can-bo",
        children: [],
      },
    ],
  };
  assert.equal(addStaffDirectoryMenu([configured], "vi")[0].children.length, 1);
});

test("English About dropdowns without a link still receive a localized staff item", () => {
  const items = addStaffDirectoryMenu(
    [{ ...about, title: "About", has_link: false, target_info: null }],
    "en",
  );
  assert.equal(items[0].children.at(-1).title, "Staff");
});

test("missing About menu gets a usable About entry containing the staff directory", () => {
  const items = addStaffDirectoryMenu([], "vi");
  assert.equal(items[0].title, "Giới thiệu");
  assert.equal(items[0].children[0].target_info.slug, "gioi-thieu/can-bo");
});
