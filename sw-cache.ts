import fs from 'fs'

import { type BuildManifest } from 'next/dist/server/get-page-files'

import pkg from './package.json'

import { SW_CACHES } from 'constants/sw'

const buildManifestPath = '.next/build-manifest.json'
const pageToIgnore = ['/_app', '/_error']
const pathPrefix = '/_next/'

const [, , ...args] = process.argv
const isProd = args.includes('--prod')

function generateServiceWorkerCacheableAssetList() {
  let buildManifest: BuildManifest

  if (isProd) {
    if (!fs.existsSync(buildManifestPath)) {
      throw new Error(`Unable to find build manifest at '${buildManifestPath}'.`)
    }

    const rawBuildManifest = fs.readFileSync(buildManifestPath, 'utf8')
    buildManifest = JSON.parse(rawBuildManifest)
  } else {
    buildManifest = { lowPriorityFiles: [], pages: {}, polyfillFiles: [] } as unknown as BuildManifest
  }

  const assets = new Set<string>(isProd ? ['/offline', '/manifest.webmanifest'] : [])

  Object.entries(buildManifest.pages).forEach(([page, files]) => {
    if (!pageToIgnore.includes(page)) {
      assets.add(page)
    }

    files.forEach((file) => assets.add(getAssetPath(file)))
  })

  buildManifest.lowPriorityFiles.forEach((file) => assets.add(getAssetPath(file)))
  buildManifest.polyfillFiles.forEach((file) => assets.add(getAssetPath(file)))

  const content = `const VERSION = '${pkg.version}';

const IS_PROD = ${isProd};

const ASSETS = ${JSON.stringify(Array.from(assets))};

const CACHES = ${JSON.stringify(SW_CACHES)};`

  fs.writeFileSync('./public/sw-cache.js', content)
}

function getAssetPath(file: string) {
  return `${pathPrefix}${file}`
}

generateServiceWorkerCacheableAssetList()
