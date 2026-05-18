const NERD_FONT_CANDIDATES = [
  "MesloLGS NF",
  "MesloLGM Nerd Font",
  "JetBrainsMono Nerd Font",
  "JetBrainsMono Nerd Font Mono",
  "JetBrainsMonoNL Nerd Font",
  "FiraCode Nerd Font",
  "FiraCode Nerd Font Mono",
  "Hack Nerd Font",
  "Hack Nerd Font Mono",
  "CaskaydiaCove Nerd Font",
  "CaskaydiaMono Nerd Font",
  "Iosevka Nerd Font",
  "Iosevka Term Nerd Font",
  "SauceCodePro Nerd Font",
  "Hasklug Nerd Font",
];

const FALLBACK_CHAIN = '"JetBrains Mono", SFMono-Regular, Menlo, monospace';
const MENLO_FIRST_CHAIN =
  'Menlo, "MesloLGS NF", "MesloLGM Nerd Font", "JetBrains Mono", SFMono-Regular, monospace';

let detected: string | null = null;
let terminalDetected: string | null = null;
let monoReady: Promise<void> | null = null;

export function ensureMonoFontsLoaded(): Promise<void> {
  if (monoReady) return monoReady;
  if (typeof document === "undefined" || !document.fonts?.load) {
    monoReady = Promise.resolve();
    return monoReady;
  }
  monoReady = Promise.allSettled([
    document.fonts.load('400 14px "JetBrains Mono"'),
    document.fonts.load('700 14px "JetBrains Mono"'),
  ]).then(() => undefined);
  return monoReady;
}

export function detectMonoFontFamily(): string {
  if (detected) return detected;
  if (typeof document === "undefined" || !document.fonts) {
    detected = FALLBACK_CHAIN;
    return detected;
  }
  for (const f of NERD_FONT_CANDIDATES) {
    try {
      if (document.fonts.check(`12px "${f}"`)) {
        detected = `"${f}", ${FALLBACK_CHAIN}`;
        return detected;
      }
    } catch {
      // Some browsers throw on invalid font shorthand; ignore.
    }
  }
  detected = FALLBACK_CHAIN;
  return detected;
}

export function detectTerminalFontFamily(): string {
  if (terminalDetected) return terminalDetected;
  if (typeof document === "undefined" || !document.fonts) {
    terminalDetected = MENLO_FIRST_CHAIN;
    return terminalDetected;
  }
  try {
    if (document.fonts.check('12px "Menlo"')) {
      terminalDetected = MENLO_FIRST_CHAIN;
      return terminalDetected;
    }
  } catch {
    // Some browsers throw on invalid font shorthand; ignore.
  }
  terminalDetected = detectMonoFontFamily();
  return terminalDetected;
}

export function getTerminalFontFamily(): string {
  return MENLO_FIRST_CHAIN;
}
