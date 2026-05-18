import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { SearchAddon } from "@xterm/addon-search";
import { TerminalPane, type TerminalPaneHandle } from "./TerminalPane";
import type { PaneNode } from "./lib/panes";

type LeafBundle = {
  setRef: (h: TerminalPaneHandle | null) => void;
  onSearch: (addon: SearchAddon) => void;
  onCwd: (cwd: string) => void;
  onExit: (code: number) => void;
};

type Props = {
  node: PaneNode;
  tabVisible: boolean;
  activeLeafId: number;
  onFocusLeaf: (leafId: number) => void;
  onDropPaths?: (leafId: number, paths: string[]) => void;
  onSplitResize: (splitId: number, sizes: number[]) => void;
  getBundle: (leafId: number) => LeafBundle;
};

export function PaneTreeView({
  node,
  tabVisible,
  activeLeafId,
  onFocusLeaf,
  onDropPaths,
  onSplitResize,
  getBundle,
}: Props) {
  const [dropActive, setDropActive] = useState(false);
  const dragDepthRef = useRef(0);

  if (node.kind === "leaf") {
    const focused = node.id === activeLeafId;
    const b = getBundle(node.id);
    return (
      <div
        onMouseDownCapture={() => {
          if (!focused) onFocusLeaf(node.id);
        }}
        // Catches focus from Tab, programmatic focus, or any path that
        // skips mousedown — keeps activeLeafId in sync with DOM focus.
        onFocus={() => {
          if (!focused) onFocusLeaf(node.id);
        }}
        data-pane-leaf={node.id}
        data-terminal-drop-leaf={node.id}
        data-drop-active={dropActive ? "true" : "false"}
        onDragEnterCapture={(event) => {
          if (!event.dataTransfer.types.includes("application/x-terax-path")) return;
          dragDepthRef.current += 1;
          setDropActive(true);
        }}
        onDragOverCapture={(event) => {
          if (!event.dataTransfer.types.includes("application/x-terax-path")) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeaveCapture={(event) => {
          if (!event.dataTransfer.types.includes("application/x-terax-path")) return;
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setDropActive(false);
        }}
        onDropCapture={(event) => {
          const path = event.dataTransfer.getData("application/x-terax-path");
          if (!path) return;
          event.preventDefault();
          event.stopPropagation();
          dragDepthRef.current = 0;
          setDropActive(false);
          onFocusLeaf(node.id);
          onDropPaths?.(node.id, [path]);
        }}
        className={cn(
          "relative h-full w-full rounded-lg transition-shadow",
          dropActive &&
            "ring-2 ring-emerald-400/80 ring-inset shadow-[inset_0_0_0_1px_rgba(74,222,128,0.35)]",
        )}
      >
        <TerminalPane
          leafId={node.id}
          visible={tabVisible}
          focused={focused}
          initialCwd={node.cwd}
          ref={b.setRef}
          onSearchReady={(_id, addon) => b.onSearch(addon)}
          onCwd={(_id, cwd) => b.onCwd(cwd)}
          onExit={(_id, code) => b.onExit(code)}
        />
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      orientation={node.dir === "row" ? "horizontal" : "vertical"}
      onLayoutChanged={(layout) =>
        onSplitResize(
          node.id,
          node.children.map((child) => layout[`pane-${child.id}`] ?? child.size ?? 0),
        )
      }
    >
      {node.children.map((child, i) => (
        <Fragment key={child.id}>
          {i > 0 && <ResizableHandle />}
          <ResizablePanel
            id={`pane-${child.id}`}
            minSize="10%"
            defaultSize={
              typeof child.size === "number" && Number.isFinite(child.size)
                ? `${child.size}%`
                : undefined
            }
          >
            <PaneTreeView
              node={child}
              tabVisible={tabVisible}
              activeLeafId={activeLeafId}
              onFocusLeaf={onFocusLeaf}
              onDropPaths={onDropPaths}
              onSplitResize={onSplitResize}
              getBundle={getBundle}
            />
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  );
}
