export type Look = 'default' | 'minimal' | 'elegant' | 'sleek';

export const LOOK_STORAGE_KEY = 'look';

export const LOOKS: { value: Look; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'sleek', label: 'Sleek' },
];

const isLook = (value: unknown): value is Look => LOOKS.some((look) => look.value === value);

// Storage can throw (blocked site data, private windows); the look then simply doesn't persist.
export function readStoredLook(): Look {
  try {
    const stored = localStorage.getItem(LOOK_STORAGE_KEY);
    return isLook(stored) ? stored : 'default';
  } catch {
    return 'default';
  }
}

export function applyLook(look: Look) {
  document.documentElement.dataset.look = look;
  try {
    localStorage.setItem(LOOK_STORAGE_KEY, look);
  } catch {
    // Ignored: see readStoredLook.
  }
}
