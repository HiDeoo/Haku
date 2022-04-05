export function getBytesFromMegaBytes(megabytes: number): number {
  return megabytes * Math.pow(1024, 2)
}
