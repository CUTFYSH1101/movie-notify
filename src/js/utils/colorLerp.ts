export class Color {
  r: number
  g: number
  b: number

  constructor(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }

  toCss():string{
    return `rgb(${this.r} ${this.g} ${this.b})`
  }
}

function lerp(from: [number, number], to: [number, number], current: number): number {
  const diffF = from[1] - from[0]
  const diffC = current - from[0]
  const diffT = to[1] - to[0]
  // diffC / diffF = (x - to[0]) / diffT
  return diffC / diffF * diffT + to[0]
}

export function lerpColor(from: Color, to: Color, current: number): Color
export function lerpColor(range: [number, number], colors: [Color, Color], current: number): Color
export function lerpColor(
  x: Color | [number, number],
  y: Color | [Color, Color],
  current: number,
): Color {
  if (x instanceof Color && y instanceof Color) {
    const r = lerp([0, 100], [x.r, y.r], current)
    const g = lerp([0, 100], [x.g, y.g], current)
    const b = lerp([0, 100], [x.b, y.b], current)
    return new Color(r, g, b)
  }
  if (Array.isArray(x) && Array.isArray(y)) {
    const r = lerp(x, [y[0].r, y[1].r], current)
    const g = lerp(x, [y[0].g, y[1].g], current)
    const b = lerp(x, [y[0].b, y[1].b], current)
    return new Color(r, g, b)
  }
  throw new Error('無法辨識的方法')
}

export function main() {
  console.log(lerp([0, 100], [0, 10], 90))
  const orange = new Color(244, 187, 95)
  const light = new Color(250, 236, 215)
  console.log(lerpColor(light, orange, 100))
}