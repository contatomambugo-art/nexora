// URL do guia (url-tvg) declarada no cabeçalho de cada lista M3U, por id da fonte.
const urls = new Map<string, string>();
export const registerEpgUrl = (sourceId: string, url?: string) => { if (url) urls.set(sourceId, url); };
export const getEpgUrl = (sourceId: string) => urls.get(sourceId);
