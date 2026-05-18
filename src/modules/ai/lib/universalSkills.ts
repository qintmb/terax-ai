import { invoke } from "@tauri-apps/api/core";

export type UniversalSkillMeta = {
  id: string;
  name: string;
  path: string;
  source: string;
  description: string;
};

export type UniversalSkillContent = UniversalSkillMeta & {
  content: string;
};

export async function listUniversalSkills(): Promise<UniversalSkillMeta[]> {
  return invoke<UniversalSkillMeta[]>("universal_skills_list");
}

export async function readUniversalSkills(
  ids: string[],
): Promise<UniversalSkillContent[]> {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  if (uniq.length === 0) return [];
  return invoke<UniversalSkillContent[]>("universal_skills_read", { ids: uniq });
}
