import { Curve, Point } from '../lib/tools/tools'

const p = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F")
const a = 0n
const b = 7n
const e2eeCurve = new Curve(a,b,p)

const x = BigInt("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798")
const y = BigInt("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")
const base = new Point(x,y)

export {e2eeCurve, base};
