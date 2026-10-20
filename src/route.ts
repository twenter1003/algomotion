// 해시 주소: 홈은 #/, 문제는 #/p/<문제 id>(설계서 5-3). 모르는 주소는 홈으로 본다
export type Route = { page: 'home' } | { page: 'problem'; id: string };

export function parseHash(hash: string): Route {
  const raw = /^#\/p\/([^/?#]+)$/.exec(hash)?.[1];
  if (!raw) return { page: 'home' };
  try {
    return { page: 'problem', id: decodeURIComponent(raw) };
  } catch {
    return { page: 'problem', id: raw }; // 깨진 인코딩은 없는 문제로 안내된다
  }
}

export const problemHref = (id: string) => `#/p/${encodeURIComponent(id)}`;
