export const IMAGE_SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

// When updating this value, please also update the `config.api.bodyParser.sizeLimit` route configuration in
// `src/pages/api/trpc/[trpc].ts` to match the new value as it cannot contain expressions.
export const IMAGE_MAX_SIZE_IN_MEGABYTES = 4

export const IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS = [320, 640, 960, 1280, 1600, 1920, 2240, 2560] as const

export const IMAGE_DEFAULT_FORMAT = 'webp'
