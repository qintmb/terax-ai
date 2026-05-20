import { cn } from "@/lib/utils";
import { ExtensionsView } from "@/modules/sidebar";
import { GitHistoryStack } from "@/modules/git-history";
import { PreviewStack, type PreviewPaneHandle } from "@/modules/preview";
import { SourceControlPanel } from "@/modules/source-control";
import type { Tab } from "@/modules/tabs";
import {
  FolderGitTwoIcon,
  GitForkIcon,
  Globe02Icon,
  PuzzleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type RightPanelView = "browser" | "git-graph" | "extensions" | "source-control";

type Props = {
  open: boolean;
  activeView: RightPanelView;
  onSelectView: (view: RightPanelView) => void;
  tabs: Tab[];
  activeId: number | null;
  registerPreviewHandle: (id: number, h: PreviewPaneHandle | null) => void;
  onPreviewUrlChange: (id: number, url: string) => void;
  onOpenCommitFileDiff: (input: {
    repoRoot: string;
    sha: string;
    shortSha: string;
    subject: string;
    path: string;
    originalPath: string | null;
  }) => number | null;
  onOpenGitGraph?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sourceControl: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenGitDiff: (input: any) => number;
};

const RAIL_HEIGHT = 36;

export function RightPanel({
  open,
  activeView,
  onSelectView,
  tabs,
  activeId,
  registerPreviewHandle,
  onPreviewUrlChange,
  onOpenCommitFileDiff,
  onOpenGitGraph,
  sourceControl,
  onOpenGitDiff,
}: Props) {
  if (!open) return null;

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border/60 bg-card">
      <div className="min-h-0 flex-1">
        {activeView === "browser" && (
          <PreviewStack
            tabs={tabs}
            activeId={activeId ?? 0}
            registerHandle={registerPreviewHandle}
            onUrlChange={onPreviewUrlChange}
          />
        )}
        {activeView === "git-graph" && (
          <GitHistoryStack
            tabs={tabs}
            activeId={activeId ?? 0}
            onOpenCommitFile={onOpenCommitFileDiff}
          />
        )}
        {activeView === "extensions" && <ExtensionsView />}
        {activeView === "source-control" && sourceControl && (
          <SourceControlPanel
            open
            sourceControl={sourceControl}
            onOpenDiff={onOpenGitDiff}
          />
        )}
      </div>

      <div
        style={{ height: RAIL_HEIGHT }}
        className="flex shrink-0 items-center justify-around border-t border-border/60 bg-card/85 px-1.5"
      >
        <RailButton
          active={activeView === "browser"}
          icon={Globe02Icon}
          label="Browser"
          onClick={() => onSelectView("browser")}
        />
        <RailButton
          active={activeView === "git-graph"}
          icon={GitForkIcon}
          label="Git Graph"
          onClick={() => {
            onOpenGitGraph?.();
            onSelectView("git-graph");
          }}
        />
        <RailButton
          active={activeView === "source-control"}
          icon={FolderGitTwoIcon}
          label="Source Control"
          onClick={() => onSelectView("source-control")}
        />
        <RailButton
          active={activeView === "extensions"}
          icon={PuzzleIcon}
          label="Extensions"
          onClick={() => onSelectView("extensions")}
        />
      </div>
    </div>
  );
}

function RailButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={cn(
        "relative inline-flex size-7 cursor-pointer items-center justify-center rounded-md border outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "border-border/70 bg-foreground/[0.07] text-foreground"
          : "border-transparent bg-foreground/[0.03] text-muted-foreground hover:border-border/60 hover:bg-foreground/[0.06] hover:text-foreground",
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={15}
        strokeWidth={active ? 2 : 1.75}
      />
      {active && (
        <span className="pointer-events-none absolute -bottom-[3px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-primary" />
      )}
    </button>
  );
}
