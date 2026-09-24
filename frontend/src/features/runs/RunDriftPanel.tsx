import { Link } from "react-router-dom";
import { ArrowRight, GitCompareArrows, Minus, Plus } from "lucide-react";
import { useFormatDateTime } from "@/lib/useFormatDateTime";
import type { NodeDrift, RunDrift } from "./types";

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">rows unknown</span>;
  if (value === 0) return <span className="text-muted-foreground">same rows</span>;
  const tone = value > 0 ? "text-emerald-600" : "text-destructive";
  return (
    <span className={tone}>
      {value > 0 ? `+${value}` : value} row{value === 1 || value === -1 ? "" : "s"}
    </span>
  );
}

function ColumnChips({ added, removed }: { added: string[]; removed: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {added.map((col) => (
        <span
          key={col}
          className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
        >
          <Plus className="h-2.5 w-2.5" /> {col}
        </span>
      ))}
      {removed.map((col) => (
        <span
          key={col}
          className="inline-flex items-center gap-0.5 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600"
        >
          <Minus className="h-2.5 w-2.5" /> {col}
        </span>
      ))}
    </div>
  );
}

function NodeRow({ node }: { node: NodeDrift }) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-card px-2.5 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="truncate font-medium">{node.label ?? node.node_id}</span>
        {node.rows_before !== null && node.rows_after !== null && (
          <span className="ml-auto flex items-center gap-1 tabular-nums text-muted-foreground">
            {node.rows_before} <ArrowRight className="h-3 w-3" /> {node.rows_after}
          </span>
        )}
        <span className="ml-0.5 text-xs">
          <Delta value={node.rows_delta} />
        </span>
      </div>
      {(node.columns_added.length > 0 || node.columns_removed.length > 0) && (
        <ColumnChips added={node.columns_added} removed={node.columns_removed} />
      )}
    </div>
  );
}

/** "Since last run" summary — schema/row-count drift vs the previous run.
 *  Renders nothing when there is no diff (first run, or nothing changed). */
export function RunDriftPanel({ drift }: { drift: RunDrift | null | undefined }) {
  const fmt = useFormatDateTime();
  if (!drift) return null;

  const { nodes, nodes_added, nodes_removed } = drift;
  const hasChanges = nodes.length > 0 || nodes_added.length > 0 || nodes_removed.length > 0;
  if (!hasChanges) return null;

  return (
    <div className="flex flex-col gap-2.5 border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          <GitCompareArrows className="h-3.5 w-3.5" /> Since last run
        </span>
        {drift.previous_run_id && (
          <Link
            to={`/runs/${drift.previous_run_id}`}
            className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Previous run{drift.previous_run_created_at ? ` · ${fmt(drift.previous_run_created_at)}` : ""}
          </Link>
        )}
      </div>

      {(nodes_added.length > 0 || nodes_removed.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {nodes_added.map((id) => (
            <span
              key={`add:${id}`}
              className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
            >
              <Plus className="h-2.5 w-2.5" /> {id} <span className="text-emerald-500">added</span>
            </span>
          ))}
          {nodes_removed.map((id) => (
            <span
              key={`rm:${id}`}
              className="inline-flex items-center gap-0.5 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600"
            >
              <Minus className="h-2.5 w-2.5" /> {id} <span className="text-red-400">removed</span>
            </span>
          ))}
        </div>
      )}

      {nodes.map((node) => (
        <NodeRow key={node.node_id} node={node} />
      ))}
    </div>
  );
}
