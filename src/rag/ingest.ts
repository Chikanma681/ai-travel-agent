import 'dotenv/config'
import { Index as UpstashIndex } from '@upstash/vector';
import { parse } from 'csv-parse/sync';
import path  from 'path';
import fs from 'fs';


const index = new UpstashIndex({
    url: process.env.UPSTASH_VECTOR_REST_URL as string,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
 })

export async function indexHotelData() {
    const csvPath = path.join(process.cwd(), 'src/dataset/montreal_reviews.csv')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    })



}

indexHotelData()

