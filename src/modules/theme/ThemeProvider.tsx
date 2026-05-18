import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadPreferences,
  onPreferencesChange,
  setTheme as persistTheme,
  type EditorThemeId,
  type ThemePref,
} from "@/modules/settings/store";

export type Theme = ThemePref;

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

// Synchronous fast-path so the initial paint isn't unstyled. The persistent
// preference (in tauri-plugin-store) overwrites this on mount; we keep a
// localStorage shadow of the *last applied* theme just for first-paint fidelity.
const FAST_PATH_KEY = "terax-ui-theme-shadow";
const CUSTOM_THEME_ATTR = "data-terax-custom-theme-key";

function readFastTheme(fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(FAST_PATH_KEY);
  return v === "dark" || v === "light" || v === "system" ? v : fallback;
}

function writeFastTheme(t: Theme): void {
  try {
    window.localStorage.setItem(FAST_PATH_KEY, t);
  } catch {
    // ignore
  }
}

function applyCustomThemeCss(root: HTMLElement, cssText: string): void {
  const prev = root.getAttribute(CUSTOM_THEME_ATTR);
  if (prev) {
    for (const key of prev.split("|")) {
      if (key) root.style.removeProperty(key);
    }
  }
  const applied: string[] = [];
  for (const raw of cssText.split(";")) {
    const idx = raw.indexOf(":");
    if (idx === -1) continue;
    const key = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();
    if (!key.startsWith("--") || !value) continue;
    root.style.setProperty(key, value);
    applied.push(key);
  }
  root.setAttribute(CUSTOM_THEME_ATTR, applied.join("|"));
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readFastTheme(defaultTheme),
  );
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [editorTheme, setEditorTheme] = useState<EditorThemeId>("atomone");
  const [appFontSize, setAppFontSize] = useState(14);
  const [appFontFamily, setAppFontFamily] = useState("Inter Variable");
  const [editorThemeCustomCss, setEditorThemeCustomCss] = useState("");

  // Hydrate from the persistent store (cross-window source of truth).
  useEffect(() => {
    let alive = true;
    void loadPreferences().then((p) => {
      if (!alive) return;
      setThemeState(p.theme);
      setEditorTheme(p.editorTheme);
      setAppFontSize(p.appFontSize);
      setAppFontFamily(p.appFontFamily);
      setEditorThemeCustomCss(p.editorThemeCustomCss);
      writeFastTheme(p.theme);
    });
    const unlistenP = onPreferencesChange((key, value) => {
      if (key === "theme" && (value === "system" || value === "light" || value === "dark")) {
        setThemeState(value);
        writeFastTheme(value);
      } else if (key === "editorTheme" && typeof value === "string") {
        setEditorTheme(value as EditorThemeId);
      } else if (key === "editorThemeCustomCss" && typeof value === "string") {
        setEditorThemeCustomCss(value);
      } else if (key === "appFontSize" && typeof value === "number") {
        setAppFontSize(value);
      } else if (key === "appFontFamily" && typeof value === "string") {
        setAppFontFamily(value);
      }
    });
    return () => {
      alive = false;
      void unlistenP.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: "dark" | "light" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.dataset.appTheme = editorTheme;
    root.style.setProperty("--app-font-size", `${appFontSize}px`);
    root.style.setProperty("--app-font-scale", String(appFontSize / 14));
    for (const size of [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 18]) {
      const key = String(size).replace(".", "_");
      root.style.setProperty(
        `--app-font-${key}`,
        `${(size * appFontSize) / 14}px`,
      );
    }
    root.style.setProperty("--ui-font-family", `"${appFontFamily}", sans-serif`);
    applyCustomThemeCss(root, editorThemeCustomCss);
  }, [resolvedTheme, editorTheme, appFontSize, appFontFamily, editorThemeCustomCss]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeFastTheme(next);
    void persistTheme(next);
  }, []);

  const value = useMemo<ThemeProviderState>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme(): ThemeProviderState {
  const ctx = useContext(ThemeProviderContext);
  if (!ctx) throw new Error("useTheme must be used within a <ThemeProvider>");
  return ctx;
}
