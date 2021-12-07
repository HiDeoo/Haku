import type { NextApiRequest, NextApiResponse } from 'next'

export default function withAdmin(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['api-key']

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).end()
    }

    return handler(req, res)
  }
}
