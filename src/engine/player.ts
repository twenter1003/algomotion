// 재생 상태 기계. 무대 연출은 Player가 index와 animating을 보고 일으킨다.
export interface PlayerState { total: number; index: number; playing: boolean; animating: boolean; speed: number }
// index: -1은 시작 전(initial 장면), k는 k단계가 끝난 모습. animating이면 index+1단계를 연출하는 중
export type PlayerEvent = { type: 'play' } | { type: 'pause' } | { type: 'next' } | { type: 'prev' }
  | { type: 'seek'; index: number } | { type: 'reset' } | { type: 'stepDone' } | { type: 'speed'; speed: number };

export const initialPlayer = (total: number): PlayerState => ({ total, index: -1, playing: false, animating: false, speed: 1 });

export function playerReducer(s: PlayerState, e: PlayerEvent): PlayerState {
  const last = s.total - 1;
  switch (e.type) {
    case 'play':
      if (s.playing) return s;
      if (s.animating) return { ...s, playing: true };
      return { ...s, index: s.index >= last ? -1 : s.index, playing: true, animating: true };
    case 'pause':
      return { ...s, playing: false };
    case 'next':
      // 연출 중이면 그 단계의 끝난 모습으로 건너뛰고, 멈춰 있으면 다음 단계 하나만 연출한다
      if (s.animating) return { ...s, index: s.index + 1, playing: false, animating: false };
      return { ...s, playing: false, animating: s.index < last };
    case 'prev':
      // 연출 중이면 연출 전 모습으로, 멈춰 있으면 한 단계 앞의 끝난 모습으로
      if (s.animating) return { ...s, playing: false, animating: false };
      return { ...s, index: Math.max(-1, s.index - 1), playing: false };
    case 'seek':
      return { ...s, index: Math.min(last, Math.max(-1, e.index)), playing: false, animating: false };
    case 'reset':
      return { ...initialPlayer(s.total), speed: s.speed };
    case 'stepDone': {
      if (!s.animating) return s;
      const index = s.index + 1;
      const more = s.playing && index < last;
      return { ...s, index, playing: more, animating: more };
    }
    case 'speed':
      return { ...s, speed: e.speed };
  }
}
