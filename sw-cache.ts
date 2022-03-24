import fs from 'fs'

import { type BuildManifest } from 'next/dist/server/get-page-files'

import pkg from './package.json'

const buildManifestPath = '.next/build-manifest.json'
const pageToIgnore = ['/_app', '/_error']
const pathPrefix = '/_next/'

// TODO(HiDeoo) process.env

function generateServiceWorkerCacheableAssetList() {
  let buildManifest: BuildManifest

  try {
    const rawBuildManifest = fs.readFileSync(buildManifestPath, 'utf8')
    buildManifest = JSON.parse(rawBuildManifest)
  } catch (error) {
    // FIXME(HiDeoo)
    buildManifest = { polyfillFiles: [], pages: {} } as unknown as BuildManifest
  }

  const assets = new Set<string>(['/offline', '/manifest.webmanifest'])

  Object.entries(buildManifest.pages).forEach(([page, files]) => {
    if (!pageToIgnore.includes(page)) {
      assets.add(page)
    }

    files.forEach((file) => assets.add(getAssetPath(file)))
  })

  buildManifest.lowPriorityFiles.forEach((file) => assets.add(getAssetPath(file)))
  buildManifest.polyfillFiles.forEach((file) => assets.add(getAssetPath(file)))

  const content = `const HAKU_VERSION = '${pkg.version}';

const HAKU_ASSETS = ${JSON.stringify(Array.from(assets))};`

  fs.writeFileSync('./public/sw-cache.js', content)
}

function getAssetPath(file: string) {
  return `${pathPrefix}${file}`
}

generateServiceWorkerCacheableAssetList()
