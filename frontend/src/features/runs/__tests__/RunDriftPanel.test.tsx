import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RunDriftPanel } from "../RunDriftPanel";
import type { RunDrift } from "@/features/runs/types";

function renderPanel(drift: RunDrift | null | undefined) {
  return render(
    <MemoryRouter>
      <RunDriftPanel drift={drift} />
    </MemoryRouter>,
  );
}

describe("RunDriftPanel", () => {
  it("renders nothing when there is no drift", () => {
    expect(renderPanel(null).container).toBeEmptyDOMElement();
    expect(renderPanel(undefined).container).toBeEmptyDOMElement();
  });

  it("renders nothing when the drift is empty", () => {
    expect(
      renderPanel({ previous_run_id: null, previous_run_created_at: null, nodes: [], nodes_added: [], nodes_removed: [] })
        .container,
    ).toBeEmptyDOMElement();
  });

  it("shows row deltas and column diffs per node", () => {
    renderPanel({
      previous_run_id: "prev-1",
      previous_run_created_at: "2026-07-01T00:00:00+00:00",
      nodes: [
        {
          node_id: "in1",
          label: "Read CSV",
          rows_before: 3,
          rows_after: 5,
          rows_delta: 2,
          columns_added: ["city"],
          columns_removed: [],
        },
        {
          node_id: "out1",
          label: "Output",
          rows_before: 5,
          rows_after: 4,
          rows_delta: -1,
          columns_added: [],
          columns_removed: ["age"],
        },
      ],
      nodes_added: [],
      nodes_removed: [],
    });

    expect(screen.getByText("Since last run")).toBeInTheDocument();
    expect(screen.getByText("Read CSV")).toBeInTheDocument();
    expect(screen.getByText(/\+2 rows/)).toBeInTheDocument();
    expect(screen.getByText(/-1 row/)).toBeInTheDocument();
    expect(screen.getByText("city")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Previous run/i })).toHaveAttribute("href", "/runs/prev-1");
  });

  it("flags nodes added to and removed from the graph", () => {
    renderPanel({
      previous_run_id: "prev-1",
      previous_run_created_at: null,
      nodes: [],
      nodes_added: ["drop"],
      nodes_removed: ["enrich"],
    });

    expect(screen.getByText("drop")).toBeInTheDocument();
    expect(screen.getByText("added")).toBeInTheDocument();
    expect(screen.getByText("enrich")).toBeInTheDocument();
    expect(screen.getByText("removed")).toBeInTheDocument();
  });
});
