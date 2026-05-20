import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TerminalStack } from "@/modules/terminal";
import type { Tab } from "@/modules/tabs";
import type { SearchAddon } from "@xterm/addon-search";
import type { TerminalPaneHandle } from "@/modules/terminal/TerminalPane";
import {
  Cancel01Icon,
  ComputerTerminal02Icon,
  IncognitoIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useRef, useEffect } from "react";

type Props = {
  tabs: Tab[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onClose: (id: number) => void;
  open: boolean;
  registerHandle: (leafId: number, handle: TerminalPaneHandle | null) => void;
  onDropPaths: (leafId: number, paths: string[]) => void;
  onSearchReady: (leafId: number, addon: SearchAddon) => void;
  onCwd: (leafId: number, cwd: string) => void;
  onExit: (leafId: number, code: number) => void;
  onFocusLeaf: (tabId: number, leafId: number) => void;
  onSplitResize: (splitId: number, sizes: number[]) => void;
};

export function BottomPanel({
  tabs,
  activeId,
  onSelect,
  onNew,
  onClose,
  open,
  registerHandle,
  onDropPaths,
  onSearchReady,
  onCwd,
  onExit,
  onFocusLeaf,
  onSplitResize,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const terminalTabs = useMemo(
    () => tabs.filter((t) => t.kind === "terminal"),
    [tabs],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  if (!open) return null;

  return (
    <div className="flex h-full min-h-0 flex-col border-t border-border/60 bg-card">
      {/* Terminal tab bar */}
      <div className="flex h-8 shrink-0 items-center gap-0.5 border-b border-border/40 px-1.5">
        <div
          ref={scrollRef}
          className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max items-center gap-0.5">
            {terminalTabs.map((t) => {
              const isActive = t.id === activeId;
              const isPrivate = t.kind === "terminal" && t.private;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className={cn(
                    "group flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-[11px] transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={isPrivate ? IncognitoIcon : ComputerTerminal02Icon}
                    size={12}
                    strokeWidth={1.75}
                    className={cn(
                      "shrink-0",
                      isPrivate && "text-amber-500",
                    )}
                  />
                  <span className="max-w-32 truncate">
                    {t.kind === "terminal" && t.cwd
                      ? (() => {
                          const parts = t.cwd.split(/[\\/]/).filter(Boolean);
                          return parts.length
                            ? parts[parts.length - 1]
                            : "/";
                        })()
                      : t.title}
                  </span>
                  {terminalTabs.length > 1 && (
                    <span
                      role="button"
                      aria-label="Close terminal"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose(t.id);
                      }}
                      className="rounded p-0.5 opacity-0 transition-opacity hover:bg-accent-foreground/10 hover:opacity-100 group-hover:opacity-60"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={10}
                        strokeWidth={2}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 border-l border-border/40 pl-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 shrink-0 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={onNew}
              >
                <HugeiconsIcon icon={PlusSignIcon} size={11} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              New Terminal
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Terminal surface */}
      <div className="relative min-h-0 flex-1">
        <TerminalStack
          tabs={tabs}
          activeId={activeId ?? 0}
          registerHandle={registerHandle}
          onDropPaths={onDropPaths}
          onSearchReady={onSearchReady}
          onCwd={onCwd}
          onExit={onExit}
          onFocusLeaf={onFocusLeaf}
          onSplitResize={onSplitResize}
        />
      </div>
    </div>
  );
}
