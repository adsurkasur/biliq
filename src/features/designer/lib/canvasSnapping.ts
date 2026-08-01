export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasSnapGuide {
  type: "vertical" | "horizontal";
  pos: number;
}

interface CanvasSnapInput {
  rect: CanvasRect;
  canvasWidth: number;
  canvasHeight: number;
  otherRects?: CanvasRect[];
  threshold?: number;
}

interface ResizeSnapInput extends CanvasSnapInput {
  edges: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
  preserveAspect: boolean;
  aspectRatio: number;
  centered: boolean;
}

interface SnapCandidate {
  delta: number;
  target: number;
}

export function snapMovedRect({
  rect,
  canvasWidth,
  canvasHeight,
  otherRects = [],
  threshold = 12
}: CanvasSnapInput): { rect: CanvasRect; guides: CanvasSnapGuide[] } {
  const targets = buildTargets(canvasWidth, canvasHeight, otherRects);
  const xCandidates = [
    findSnap(rect.x, targets.x, threshold),
    findSnap(rect.x + rect.width / 2, targets.x, threshold),
    findSnap(rect.x + rect.width, targets.x, threshold)
  ].filter((candidate): candidate is SnapCandidate => Boolean(candidate));
  const yCandidates = [
    findSnap(rect.y, targets.y, threshold),
    findSnap(rect.y + rect.height / 2, targets.y, threshold),
    findSnap(rect.y + rect.height, targets.y, threshold)
  ].filter((candidate): candidate is SnapCandidate => Boolean(candidate));
  const bestX = pickBest(xCandidates);
  const bestY = pickBest(yCandidates);

  return {
    rect: {
      ...rect,
      x: rect.x + (bestX?.delta ?? 0),
      y: rect.y + (bestY?.delta ?? 0)
    },
    guides: [
      ...(bestX ? [{ type: "vertical" as const, pos: bestX.target }] : []),
      ...(bestY ? [{ type: "horizontal" as const, pos: bestY.target }] : [])
    ]
  };
}

export function snapResizedRect({
  rect,
  canvasWidth,
  canvasHeight,
  otherRects = [],
  threshold = 12,
  edges,
  preserveAspect,
  aspectRatio,
  centered
}: ResizeSnapInput): { rect: CanvasRect; guides: CanvasSnapGuide[] } {
  const targets = buildTargets(canvasWidth, canvasHeight, otherRects);
  const xValue = edges.left ? rect.x : edges.right ? rect.x + rect.width : null;
  const yValue = edges.top ? rect.y : edges.bottom ? rect.y + rect.height : null;
  const snapX = xValue === null ? null : findSnap(xValue, targets.x, threshold);
  const snapY = yValue === null ? null : findSnap(yValue, targets.y, threshold);

  if (preserveAspect) {
    const chosen = pickAxisSnap(snapX, snapY);
    if (!chosen) return { rect, guides: [] };
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const right = rect.x + rect.width;
    const bottom = rect.y + rect.height;
    let width = rect.width;
    let height = rect.height;

    if (chosen.axis === "x") {
      const factor = centered ? 2 : 1;
      width = Math.max(24, rect.width + chosen.snap.delta * factor * (edges.left ? -1 : 1));
      height = Math.max(24, width / aspectRatio);
      width = height * aspectRatio;
    } else {
      const factor = centered ? 2 : 1;
      height = Math.max(24, rect.height + chosen.snap.delta * factor * (edges.top ? -1 : 1));
      width = Math.max(24, height * aspectRatio);
      height = width / aspectRatio;
    }

    const x = centered
      ? centerX - width / 2
      : edges.left
        ? right - width
        : !edges.left && !edges.right
          ? centerX - width / 2
          : rect.x;
    const y = centered
      ? centerY - height / 2
      : edges.top
        ? bottom - height
        : !edges.top && !edges.bottom
          ? centerY - height / 2
          : rect.y;

    return {
      rect: { x, y, width, height },
      guides: [{ type: chosen.axis === "x" ? "vertical" : "horizontal", pos: chosen.snap.target }]
    };
  }

  let { x, y, width, height } = rect;
  const guides: CanvasSnapGuide[] = [];
  if (snapX) {
    if (centered) {
      const nextWidth = Math.max(24, width + snapX.delta * 2 * (edges.left ? -1 : 1));
      x += (width - nextWidth) / 2;
      width = nextWidth;
    } else if (edges.left) {
      x += snapX.delta;
      width -= snapX.delta;
    } else {
      width += snapX.delta;
    }
    guides.push({ type: "vertical", pos: snapX.target });
  }
  if (snapY) {
    if (centered) {
      const nextHeight = Math.max(24, height + snapY.delta * 2 * (edges.top ? -1 : 1));
      y += (height - nextHeight) / 2;
      height = nextHeight;
    } else if (edges.top) {
      y += snapY.delta;
      height -= snapY.delta;
    } else {
      height += snapY.delta;
    }
    guides.push({ type: "horizontal", pos: snapY.target });
  }

  return { rect: { x, y, width, height }, guides };
}

function buildTargets(canvasWidth: number, canvasHeight: number, others: CanvasRect[]) {
  return {
    x: [
      0,
      canvasWidth / 2,
      canvasWidth,
      ...others.flatMap((rect) => [rect.x, rect.x + rect.width / 2, rect.x + rect.width])
    ],
    y: [
      0,
      canvasHeight / 2,
      canvasHeight,
      ...others.flatMap((rect) => [rect.y, rect.y + rect.height / 2, rect.y + rect.height])
    ]
  };
}

function findSnap(value: number, targets: number[], threshold: number): SnapCandidate | null {
  let best: SnapCandidate | null = null;
  for (const target of targets) {
    const delta = target - value;
    if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) {
      best = { delta, target };
    }
  }
  return best;
}

function pickBest(candidates: SnapCandidate[]): SnapCandidate | null {
  return candidates.reduce<SnapCandidate | null>(
    (best, candidate) => !best || Math.abs(candidate.delta) < Math.abs(best.delta) ? candidate : best,
    null
  );
}

function pickAxisSnap(x: SnapCandidate | null, y: SnapCandidate | null) {
  if (!x && !y) return null;
  if (x && (!y || Math.abs(x.delta) <= Math.abs(y.delta))) return { axis: "x" as const, snap: x };
  return { axis: "y" as const, snap: y! };
}
