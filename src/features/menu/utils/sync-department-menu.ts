import type { MenuItemTreeNode } from "../types/menu.types";

interface FacultyLike {
  id: string;
  name: string;
  slug: string;
  sort_order?: number | null;
}

/**
 * Đồng bộ cột "Các khoa" của menu với bảng đơn vị trong DB.
 *
 * Mỗi cột (node cấp 1) có chứa mục trỏ tới DEPARTMENT sẽ được dựng lại danh sách
 * khoa từ `faculties` (tên + slug lấy từ DB), nên đổi tên / thêm / ẩn khoa trong admin
 * là footer tự cập nhật, không cần sửa menu thủ công. Các mục không phải DEPARTMENT
 * trong cùng cột được giữ nguyên và xếp sau danh sách khoa.
 */
export function syncDepartmentMenuColumns(
  items: MenuItemTreeNode[],
  faculties: FacultyLike[],
): MenuItemTreeNode[] {
  if (faculties.length === 0) return items;

  return items.map((column) => {
    const children = column.children ?? [];
    const template = children.find((child) => child.target_type === "DEPARTMENT");
    if (!template) return column;

    const facultyNodes: MenuItemTreeNode[] = faculties.map((faculty, index) => ({
      ...template,
      id: `faculty-${faculty.id}`,
      parent_id: column.id,
      target_type: template.target_type,
      target_id: faculty.id,
      target_info: { title: faculty.name, slug: faculty.slug },
      sort_order: index + 1,
      is_visible: true,
      has_link: true,
      title: faculty.name,
      children: [],
    }));

    const others = children.filter((child) => child.target_type !== "DEPARTMENT");
    return { ...column, children: [...facultyNodes, ...others] };
  });
}
