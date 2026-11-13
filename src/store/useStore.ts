import { create } from "zustand";
import type { DependencySpec, Status } from "@/domain/types";
import type { Locale } from "@/i18n/types";

export interface Summons {
  specs: DependencySpec[];
  packageName?: string;
  truncated: number;
  /** Fixed when summoning so every grave is judged against the same moment. */
  now: number;
}

export type KindFilter = "all" | "prod" | "dev";
export type View = "yard" | "ledger";

interface State {
  locale: Locale;
  draft: string;
  includePeer: boolean;
  includeOptional: boolean;
  summons: Summons | null;
  hidden: Partial<Record<Status, boolean>>;
  query: string;
  kind: KindFilter;
  view: View;
  motionOff: boolean;
  selectedId: string | null;

  setLocale: (locale: Locale) => void;
  setDraft: (draft: string) => void;
  setIncludePeer: (value: boolean) => void;
  setIncludeOptional: (value: boolean) => void;
  summon: (summons: Summons) => void;
  leave: () => void;
  toggleStatus: (status: Status) => void;
  setQuery: (query: string) => void;
  setKind: (kind: KindFilter) => void;
  setView: (view: View) => void;
  toggleMotion: () => void;
  select: (id: string | null) => void;
}

const MOTION_KEY = "dg:motion-off";
const LOCALE_KEY = "dg:locale";

/** English unless the visitor picked Chinese before. */
function readLocale(): Locale {
  try {
    return localStorage.getItem(LOCALE_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function readMotionOff(): boolean {
  try {
    return localStorage.getItem(MOTION_KEY) === "1";
  } catch {
    return false;
  }
}

export const useStore = create<State>()((set, get) => ({
  locale: readLocale(),
  draft: "",
  includePeer: false,
  includeOptional: false,
  summons: null,
  hidden: {},
  query: "",
  kind: "all",
  view: "yard",
  motionOff: readMotionOff(),
  selectedId: null,

  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // The choice still applies for this visit.
    }
    set({ locale });
  },
  setDraft: (draft) => set({ draft }),
  setIncludePeer: (includePeer) => set({ includePeer }),
  setIncludeOptional: (includeOptional) => set({ includeOptional }),
  summon: (summons) => set({ summons, hidden: {}, query: "", kind: "all", selectedId: null }),
  leave: () => set({ summons: null, selectedId: null }),
  toggleStatus: (status) => set({ hidden: { ...get().hidden, [status]: !get().hidden[status] } }),
  setQuery: (query) => set({ query }),
  setKind: (kind) => set({ kind }),
  setView: (view) => set({ view }),
  toggleMotion: () => {
    const motionOff = !get().motionOff;
    try {
      localStorage.setItem(MOTION_KEY, motionOff ? "1" : "0");
    } catch {
      // The preference still applies for this visit.
    }
    set({ motionOff });
  },
  select: (selectedId) => set({ selectedId }),
}));
