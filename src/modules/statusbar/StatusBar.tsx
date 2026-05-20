import { useChatStore } from "@/modules/ai";
import { AgentStatusPill } from "@/modules/ai/components/AgentStatusPill";
import {
  AiOpenButton,
  AiStatusBarControls,
} from "@/modules/ai/components/AiStatusBarControls";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ComputerTerminal02Icon,
  IncognitoIcon,
  LayoutThreeColumnIcon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CwdBreadcrumb } from "./CwdBreadcrumb";
import { WorkspaceEnvSelector } from "./WorkspaceEnvSelector";
import type { WorkspaceEnv } from "@/modules/workspace";

type Props = {
  cwd: string | null;
  filePath?: string | null;
  home: string | null;
  onCd: (path: string) => void;
  onWorkspaceChange: (env: WorkspaceEnv) => void;
  onOpenMini: () => void;
  hasComposer: boolean;
  privateActive: boolean;
  leftPanelOpen: boolean;
  bottomPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleBottomPanel: () => void;
  onToggleRightPanel: () => void;
};

function PanelToggle({
  open,
  onToggle,
  icon,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-6 shrink-0 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground",
            open && "bg-accent text-foreground",
          )}
          onClick={onToggle}
        >
          <HugeiconsIcon icon={icon} size={13} strokeWidth={1.75} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[11px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function StatusBar({
  cwd,
  filePath,
  home,
  onCd,
  onWorkspaceChange,
  onOpenMini,
  hasComposer,
  privateActive,
  leftPanelOpen,
  bottomPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleBottomPanel,
  onToggleRightPanel,
}: Props) {
  const panelOpen = useChatStore((s) => s.panelOpen);
  const openPanel = useChatStore((s) => s.openPanel);

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-card/60 px-3 text-[11px]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex shrink-0 items-center gap-0.5">
          <PanelToggle
            open={leftPanelOpen}
            onToggle={onToggleLeftPanel}
            icon={SidebarLeftIcon}
            label="Toggle Explorer Panel"
          />
          <PanelToggle
            open={bottomPanelOpen}
            onToggle={onToggleBottomPanel}
            icon={ComputerTerminal02Icon}
            label="Toggle Terminal Panel"
          />
          <PanelToggle
            open={rightPanelOpen}
            onToggle={onToggleRightPanel}
            icon={LayoutThreeColumnIcon}
            label="Toggle Right Panel"
          />
        </div>
        <WorkspaceEnvSelector onSelect={onWorkspaceChange} />
        <CwdBreadcrumb cwd={cwd} filePath={filePath} home={home} onCd={onCd} />
        {privateActive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex shrink-0 cursor-default items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10.5px] font-medium text-amber-700 dark:text-amber-400">
                <HugeiconsIcon icon={IncognitoIcon} size={11} strokeWidth={2} />
                <span>Private: hidden from AI</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-64 text-[11px] leading-relaxed">
              AI can't see this terminal's output. Use it for secrets, SSH, or
              anything you don't want sent to the model.
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <AgentStatusPill onClick={onOpenMini} />
        {panelOpen && hasComposer ? (
          <AiStatusBarControls />
        ) : (
          <AiOpenButton onOpen={openPanel} />
        )}
      </div>
    </footer>
  );
}
