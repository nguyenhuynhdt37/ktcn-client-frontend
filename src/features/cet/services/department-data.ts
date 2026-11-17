import { departmentService } from "@/features/department/services/departmentService";
import { programService } from "@/features/program/services/programService";

export type CetFacultySummary = {
  slug: string;
  name: string;
  programCount: number;
  staffCount: number;
};

/** Faculties with the number of published, active programmes each one offers. */
export async function getCetFacultySummaries(locale: string): Promise<CetFacultySummary[]> {
  const [faculties, programs] = await Promise.all([
    departmentService.getDepartments({ unit_type: "faculty", lang: locale }),
    programService.getAll(locale),
  ]);

  const programCounts = new Map<string, number>();
  for (const program of programs) {
    if (!program.is_active || !program.is_published) continue;
    programCounts.set(program.department_id, (programCounts.get(program.department_id) ?? 0) + 1);
  }

  return (faculties ?? [])
    .filter((item) => item.unit_type === "faculty")
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      programCount: programCounts.get(item.id) ?? 0,
      staffCount: item.staff_count ?? 0,
    }));
}
