import { useSyncExternalStore } from 'react';

export type PanelId = 'details' | 'stage' | 'race' | 'notes' | 'bars' | 'code' | 'vars';

export interface LayoutSizes {
  sidebarW: number;
  codeW: number;
  stageZoom: number;
  freeScroll: boolean;
  heights: Partial<Record<PanelId, number>>;
}

const STORAGE_KEY = 'algomotion:layout:v1';

export const LAYOUT_DEFAULTS: LayoutSizes = {
  sidebarW: 240,
  codeW: 380,
  stageZoom: 1,
  freeScroll: false,
  heights: {},
};

const clamp = (v: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, v)));

function loadSizes(): LayoutSizes {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return LAYOUT_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<LayoutSizes>;
    return {
      sidebarW: typeof parsed.sidebarW === 'number' ? clamp(parsed.sidebarW, 180, 460) : LAYOUT_DEFAULTS.sidebarW,
      codeW: typeof parsed.codeW === 'number' ? clamp(parsed.codeW, 280, 760) : LAYOUT_DEFAULTS.codeW,
      stageZoom: typeof parsed.stageZoom === 'number' ? Math.min(2, Math.max(0.5, parsed.stageZoom)) : LAYOUT_DEFAULTS.stageZoom,
      freeScroll: typeof parsed.freeScroll === 'boolean' ? parsed.freeScroll : LAYOUT_DEFAULTS.freeScroll,
      heights: parsed.heights && typeof parsed.heights === 'object' ? { ...parsed.heights } : {},
    };
  } catch {
    return LAYOUT_DEFAULTS;
  }
}

let currentSizes: LayoutSizes = loadSizes();
const listeners = new Set<() => void>();

function saveAndNotify(next: LayoutSizes) {
  currentSizes = next;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // 저장소 쓰기 실패 시 메모리 상태만 유지
  }
  listeners.forEach((fn) => fn());
}

export const layoutStore = {
  get: () => currentSizes,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setSidebarW: (w: number) => saveAndNotify({ ...currentSizes, sidebarW: clamp(w, 180, 460) }),
  setCodeW: (w: number) => saveAndNotify({ ...currentSizes, codeW: clamp(w, 280, 760) }),
  setStageZoom: (z: number) => saveAndNotify({ ...currentSizes, stageZoom: Math.round(Math.min(2, Math.max(0.5, z)) * 100) / 100 }),
  setFreeScroll: (freeScroll: boolean) => saveAndNotify({ ...currentSizes, freeScroll }),
  setHeight: (id: PanelId, h: number | undefined, min = 80, max = 1400) => {
    const heights = { ...currentSizes.heights };
    if (h === undefined) delete heights[id];
    else heights[id] = clamp(h, min, max);
    saveAndNotify({ ...currentSizes, heights });
  },
  resetAll: () => saveAndNotify({ ...LAYOUT_DEFAULTS, heights: {} }),
  hasCustomSizes: (s: LayoutSizes) =>
    s.sidebarW !== LAYOUT_DEFAULTS.sidebarW ||
    s.codeW !== LAYOUT_DEFAULTS.codeW ||
    s.stageZoom !== LAYOUT_DEFAULTS.stageZoom ||
    s.freeScroll !== LAYOUT_DEFAULTS.freeScroll ||
    Object.keys(s.heights).length > 0,
};

export function useLayoutSizes(): LayoutSizes {
  return useSyncExternalStore(layoutStore.subscribe, layoutStore.get);
}
