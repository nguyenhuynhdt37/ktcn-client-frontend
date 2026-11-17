import { articleService } from "@/features/article/services/articleService";
import { departmentService } from "@/features/department/services/departmentService";
import { programService } from "@/features/program/services/programService";
import { settingService } from "@/features/setting/services/settingService";

export async function getCetHomeData(locale: string) {
  const [news, notices, programs, departments, settings] = await Promise.all([
    articleService.getArticlesByCategory("tin-tuc-va-su-kien", 1, 3),
    articleService.getArticlesByCategory("thong-bao", 1, 5),
    programService.getAll(locale, "bachelor"),
    departmentService.getDepartments({ lang: locale }),
    settingService.getSiteSettings(),
  ]);
  return {
    news: news?.items ?? [],
    notices: notices?.items ?? [],
    programs: programs.filter((item) => item.is_active && item.is_published),
    faculties: (departments ?? []).filter((item) => item.unit_type === "faculty"),
    labCount: departments?.filter((item) => item.unit_type === "lab").length,
    settings,
    unavailable: news === null && notices === null && departments === null,
  };
}

export type CetHomeData = Awaited<ReturnType<typeof getCetHomeData>>;
