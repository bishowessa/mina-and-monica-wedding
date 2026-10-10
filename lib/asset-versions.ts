export const ASSET_VERSION = '4'

/** Append a cache-busting query param for static public assets. */
export function assetUrl(path: string): string {
  return `${path}?v=${ASSET_VERSION}`
}
