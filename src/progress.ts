// 본 문제(정석 풀이를 끝까지 봄)와 이어 보기(마지막으로 연 문제)를 브라우저 저장소에 둔다.
// 저장소가 없거나 막혀 있거나 값이 깨져도 빈 값으로 읽고, 쓰지 못하면 그냥 넘어간다(설계서 5-4).
export interface ProgressStore { seen(): Set<string>; markSeen(id: string): void; last(): string | null; setLast(id: string): void }

const SEEN = 'algomotion:seen'; // JSON 배열
const LAST = 'algomotion:last';

export function createProgress(storage: Pick<Storage, 'getItem' | 'setItem'> | null): ProgressStore {
  const seen = () => {
    try {
      const list: unknown = JSON.parse(storage?.getItem(SEEN) ?? '[]');
      return new Set(Array.isArray(list) ? list.filter((id): id is string => typeof id === 'string') : []);
    } catch {
      return new Set<string>();
    }
  };
  return {
    seen,
    markSeen(id) {
      try {
        storage?.setItem(SEEN, JSON.stringify([...seen().add(id)]));
      } catch {
        // 저장하지 못해도 화면은 계속
      }
    },
    last() {
      try {
        return storage?.getItem(LAST) ?? null;
      } catch {
        return null;
      }
    },
    setLast(id) {
      try {
        storage?.setItem(LAST, id);
      } catch {
        // 저장하지 못해도 화면은 계속
      }
    },
  };
}

// 쿠키를 막은 브라우저에서는 localStorage를 꺼내기만 해도 예외가 난다(Node에는 window가 없어 여기서 null)
const browserStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};
export const progress: ProgressStore = createProgress(browserStorage());
