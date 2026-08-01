export interface CanvasObjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export function isCanvasObjectOutOfBounds(
  object: CanvasObjectBounds,
  canvasWidth: number,
  canvasHeight: number,
  tolerance = 0.5
): boolean {
  const rotation = ((object.rotation ?? 0) * Math.PI) / 180;
  const centerX = object.x + object.width / 2;
  const centerY = object.y + object.height / 2;
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const corners = [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight]
  ];

  return corners.some(([localX, localY]) => {
    const x = centerX + localX * cosine - localY * sine;
    const y = centerY + localX * sine + localY * cosine;
    return (
      x < -tolerance ||
      y < -tolerance ||
      x > canvasWidth + tolerance ||
      y > canvasHeight + tolerance
    );
  });
}
