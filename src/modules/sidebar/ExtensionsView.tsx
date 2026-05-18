import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Add01Icon,
  Cancel01Icon,
  Copy01Icon,
  PuzzleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

type McpEntry = {
  id: string;
  name: string;
  command: string;
  args: string;
};

const STORAGE_KEY = "terax.extensions.mcp";

const DEFAULT_ENTRY: McpEntry = {
  id: crypto.randomUUID(),
  name: "filesystem",
  command: "npx",
  args: '-y @modelcontextprotocol/server-filesystem /Users/elbruz',
};

export function ExtensionsView() {
  const [entries, setEntries] = useState<McpEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setEntries([DEFAULT_ENTRY]);
        return;
      }
      const parsed = JSON.parse(raw) as McpEntry[];
      setEntries(parsed.length ? parsed : [DEFAULT_ENTRY]);
    } catch {
      setEntries([DEFAULT_ENTRY]);
    }
  }, []);

  useEffect(() => {
    if (!entries.length) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const configText = useMemo(() => {
    const mcpServers: Record<string, { command: string; args: string[] }> = {};
    for (const entry of entries) {
      const name = entry.name.trim();
      if (!name) continue;
      mcpServers[name] = {
        command: entry.command.trim(),
        args: splitArgs(entry.args),
      };
    }
    return JSON.stringify({ mcpServers }, null, 2);
  }, [entries]);

  const copyConfig = async () => {
    await navigator.clipboard.writeText(configText);
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
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HugeiconsIcon icon={PuzzleIcon} size={16} strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-[12px] font-medium">MCP starter</div>
              <div className="text-[10.5px] text-muted-foreground">
                Tambah beberapa MCP lalu copy config JSON.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              className="rounded-md"
              onClick={() =>
                setEntries((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    name: "",
                    command: "",
                    args: "",
                  },
                ])
              }
            >
              <HugeiconsIcon icon={Add01Icon} />
              Add MCP
            </Button>
            <Button
              variant="outline"
              size="xs"
              className="rounded-md"
              onClick={() => void copyConfig()}
            >
              <HugeiconsIcon icon={Copy01Icon} />
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="rounded-lg border border-border/60 bg-card/55 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[11px] font-medium text-muted-foreground">
                  MCP {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEntries((prev) => prev.filter((x) => x.id !== entry.id))
                  }
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove MCP"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  value={entry.name}
                  onChange={(e) =>
                    patchEntry(entry.id, { name: e.target.value }, setEntries)
                  }
                  placeholder="Server name"
                  className="h-8 rounded-md text-[12px]"
                />
                <Input
                  value={entry.command}
                  onChange={(e) =>
                    patchEntry(entry.id, { command: e.target.value }, setEntries)
                  }
                  placeholder="Command"
                  className="h-8 rounded-md font-mono text-[12px]"
                />
                <Textarea
                  value={entry.args}
                  onChange={(e) =>
                    patchEntry(entry.id, { args: e.target.value }, setEntries)
                  }
                  placeholder='Args, contoh: -y @modelcontextprotocol/server-filesystem /Users/elbruz'
                  className="min-h-20 rounded-md font-mono text-[12px]"
                />
              </div>
            </div>
          ))}
        </div>

        <pre className="mt-3 overflow-auto rounded-lg border border-border/60 bg-background/70 p-3 text-[10.5px] leading-4 text-muted-foreground">
          {configText}
        </pre>
      </div>
    </div>
  );
}

function patchEntry(
  id: string,
  patch: Partial<McpEntry>,
  setEntries: Dispatch<SetStateAction<McpEntry[]>>,
) {
  setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
}

function splitArgs(input: string): string[] {
  return input
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
