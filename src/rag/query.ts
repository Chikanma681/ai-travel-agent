import 'dotenv/config'
import { Index as UpstashIndex } from '@upstash/vector'

const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
})

export const searchMontrealHotels = async (
  query: string,
  topK: number = 5
) => {
  try {
    const results = await index.query({
      data: query,
      topK,
      includeMetadata: true,
      includeData: true,
    })

    return results
  } catch (error) {
    console.error('Vector search error:', error)
    return []
  }
}
