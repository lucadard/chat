import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from 'octokit'
const octokit = new Octokit({
  baseUrl: 'https://api.github.com/',
  auth: process.env.GITHUB_APIKEY
})
// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const name = req.query.name as string
  const { data } = await octokit.request('GET users/{name}', {
    name
  })

  res.status(200).json({ data })
}
