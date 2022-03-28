import fs from 'fs/promises'

import esbuild from 'esbuild'
import { type BuildManifest } from 'next/dist/server/get-page-files'

import pkg from './package.json'

import { SW_CACHES } from 'constants/sw'

const buildManifestPath = '.next/build-manifest.json'
const pageToIgnore = ['/_app', '/_error']
const pathPrefix = '/_next/'

const [, , ...args] = process.argv
const isProd = args.includes('--prod')

async function build() {
  try {
    await buildServiceWorker()
    await buildServiceWorkerConfig()
  } catch (error) {
    console.error('Unable to build service worker:', error)

    process.exit(1)
  }
}

function buildServiceWorker() {
  return esbuild.build({
    bundle: true,
    entryPoints: ['src/sw/sw.ts'],
    minify: isProd,
    outfile: 'public/sw.js',
    target: 'es6',
  })
}

async function buildServiceWorkerConfig() {
  let buildManifest: BuildManifest

  if (isProd) {
    try {
      const rawBuildManifest = await fs.readFile(buildManifestPath, 'utf8')
      buildManifest = JSON.parse(rawBuildManifest)
    } catch (error) {
      throw new Error(`Unable to open build manifest at '${buildManifestPath}'.`)
    }
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

  const { code: config } = await esbuild.transform(
    `const VERSION = '${pkg.version}';

const IS_PROD = ${isProd};

const ASSETS = ${JSON.stringify(Array.from(assets))};

const CACHES = ${JSON.stringify(SW_CACHES)};`,
    {
      minify: isProd,
      target: 'es6',
    }
  )

  return fs.writeFile('./public/sw-config.js', config)
}

function getAssetPath(file: string) {
  return `${pathPrefix}${file}`
}

build()
