import { Fragment } from "react";
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
  onSplitResize: (splitId: number, sizes: number[]) => void;
  getBundle: (leafId: number) => LeafBundle;
};

export function PaneTreeView({
  node,
  tabVisible,
  activeLeafId,
  onFocusLeaf,
  onSplitResize,
  getBundle,
}: Props) {
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
        className="relative h-full w-full"
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
              onSplitResize={onSplitResize}
              getBundle={getBundle}
            />
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  );
}
