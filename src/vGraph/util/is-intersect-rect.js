export default function isIntersectRect(p, r) {
  return p.x > r.x1 && p.x < r.x2 && p.y > r.y1 && p.y < r.y2
}
