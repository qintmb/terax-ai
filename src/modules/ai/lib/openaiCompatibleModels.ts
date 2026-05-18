export type OpenAICompatibleModelInfo = {
  id: string;
  ownedBy: string | null;
};

type ModelsResponse = {
  data?: Array<{
    id?: string;
    owned_by?: string;
  }>;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export async function fetchOpenAICompatibleModels(
  baseUrl: string,
  apiKey?: string | null,
): Promise<OpenAICompatibleModelInfo[]> {
  const root = normalizeBaseUrl(baseUrl);
  if (!root) return [];
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (apiKey?.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }
  const res = await fetch(`${root}/models`, { headers });
  if (!res.ok) {
    throw new Error(`Models API ${res.status}`);
  }
  const payload = (await res.json()) as ModelsResponse;
  const seen = new Set<string>();
  const out: OpenAICompatibleModelInfo[] = [];
  for (const item of payload.data ?? []) {
    const id = item.id?.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, ownedBy: item.owned_by?.trim() || null });
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}
