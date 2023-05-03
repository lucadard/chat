import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from 'octokit'
const octokit = new Octokit({
  baseUrl: 'https://api.github.com/',
  auth: process.env.GITHUB_APIKEY
})
// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.query as string
  const { data } = await octokit.request('GET search/users?q={query}', {
    query
  })

  res.status(200).json({ data })
}
