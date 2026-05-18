import { Button } from "@/components/ui/button";
import { openSettingsWindow } from "@/modules/settings/openSettingsWindow";
import {
  AiScanIcon,
  CodeIcon,
  Copy01Icon,
  PaintBrush02Icon,
  PuzzleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

const MCP_SAMPLE = `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/elbruz"]
    }
  }
}`;

export function ExtensionsView() {
  const [copied, setCopied] = useState(false);

  const copyMcpSample = async () => {
    await navigator.clipboard.writeText(MCP_SAMPLE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-8 shrink-0 items-center border-b border-border/60 px-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Extensions
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          <ExtensionCard
            icon={PaintBrush02Icon}
            title="Custom themes"
            description="Edit app/editor CSS tokens from Settings."
            action="Open"
            onAction={() => void openSettingsWindow("general")}
          />
          <ExtensionCard
            icon={AiScanIcon}
            title="Model providers"
            description="Connect OpenAI-compatible local routers and remote APIs."
            action="Open"
            onAction={() => void openSettingsWindow("models")}
          />
          <div className="rounded-lg border border-border/60 bg-card/55 p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <HugeiconsIcon icon={PuzzleIcon} size={16} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium">MCP starter</div>
                <div className="text-[10.5px] text-muted-foreground">
                  Copy config for external MCP clients now; native MCP runtime next.
                </div>
              </div>
            </div>
            <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-border/60 bg-background/70 p-2 text-[10.5px] leading-4 text-muted-foreground">
              {MCP_SAMPLE}
            </pre>
            <Button
              variant="outline"
              size="xs"
              className="mt-2 rounded-md"
              onClick={() => void copyMcpSample()}
            >
              <HugeiconsIcon icon={copied ? CodeIcon : Copy01Icon} />
              {copied ? "Copied" : "Copy MCP config"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtensionCard({
  icon,
  title,
  description,
  action,
  onAction,
}: {
  icon: typeof PuzzleIcon;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/55 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium">{title}</div>
        <div className="text-[10.5px] leading-4 text-muted-foreground">
          {description}
        </div>
      </div>
      <Button variant="outline" size="xs" className="rounded-md" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}
