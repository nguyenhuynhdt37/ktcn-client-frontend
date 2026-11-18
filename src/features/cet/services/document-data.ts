import { httpClient } from "@/shared/api/httpClient";

export const DOCUMENT_KINDS = {
  "van-ban-bieu-mau": "VAN_BAN",
  "bai-giang-giao-trinh": "BAI_GIANG",
} as const;

export type DocumentKindSlug = keyof typeof DOCUMENT_KINDS;

export function isDocumentKindSlug(value: string): value is DocumentKindSlug {
  return Object.prototype.hasOwnProperty.call(DOCUMENT_KINDS, value);
}

export type PortalDocument = {
  id: string;
  kind: "VAN_BAN" | "BAI_GIANG";
  title_vi: string;
  title_en: string | null;
  description: string | null;
  file_name: string;
  file_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type CetDocumentData = {
  items: PortalDocument[];
  page: number;
  totalPages: number;
  totalItems: number;
  search: string;
  unavailable: boolean;
};

export const DOCUMENT_PAGE_SIZE = 12;

export async function getCetDocuments(
  slug: DocumentKindSlug,
  page: number,
  search: string,
): Promise<CetDocumentData> {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const data = await httpClient.get<{
    items: PortalDocument[];
    page: number;
    total_pages: number;
    total_items: number;
  }>("/api/v1/portal/documents", {
    revalidate: 60,
    tags: ["documents"],
    params: {
      kind: DOCUMENT_KINDS[slug],
      page: safePage,
      page_size: DOCUMENT_PAGE_SIZE,
      search: search.slice(0, 100),
    },
  });
  return {
    items: data?.items ?? [],
    page: data?.page ?? safePage,
    totalPages: data?.total_pages ?? 1,
    totalItems: data?.total_items ?? 0,
    search,
    unavailable: data === null,
  };
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
