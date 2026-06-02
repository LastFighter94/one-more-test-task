export interface EllipseParams {
  cx: number
  cy: number
  a: number
  b: number
  theta: number // degrees
}

export interface Point {
  x: number
  y: number
}

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/**
 * Rightmost point of a rotated ellipse (apex).
 * Found by setting dx/dt = 0 in parametric form.
 */
export function computeApex(e: EllipseParams): Point {
  const cosTheta = toRad(e.theta)
  const t0 = Math.atan2(-e.b * Math.sin(cosTheta), e.a * Math.cos(cosTheta))
  return {
    x: e.cx + e.a * Math.cos(t0) * Math.cos(cosTheta) - e.b * Math.sin(t0) * Math.sin(cosTheta),
    y: e.cy + e.a * Math.cos(t0) * Math.sin(cosTheta) + e.b * Math.sin(t0) * Math.cos(cosTheta),
  }
}

/**
 * Recompute a theta given a new apex position (center and b stay fixed).
 *
 * From apex conditions:
 *   dx² = a²cos²θ + b²sin²θ
 *   dx·dy = (a²−b²)·sin(2θ)/2
 * Solving for θ first, then a:
 *   tanθ = dx·dy / (dx² − b²)
 *   a = sqrt((dx² − b²sin²θ) / cos²θ)
 */
export function computeEllipseFromApex(
  cx: number,
  cy: number,
  apexX: number,
  apexY: number,
  b: number,
): Pick<EllipseParams, 'a' | 'b' | 'theta'> {
  const dx = apexX - cx
  const dy = apexY - cy

  const thetaRad = Math.atan2(dx * dy, dx * dx - b * b)
  const cosTheta = Math.cos(thetaRad)
  const sinTheta = Math.sin(thetaRad)

  const a2 = (dx * dx - b * b * sinTheta * sinTheta) / (cosTheta * cosTheta)
  let a = Math.sqrt(Math.max(a2, b * b))

  // Ensure convention a >= b; if violated swap with 90° rotation
  if (a < b) {
    ;[a] = [b]
  }

  return { a, b, theta: toDeg(thetaRad) }
}
