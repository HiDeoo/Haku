import ky from 'ky'

export const client = ky.create({ prefixUrl: '/api', retry: 0 })
