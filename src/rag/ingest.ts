import 'dotenv/config'
import { Index as UpstashIndex } from '@upstash/vector';
import { parse } from 'csv-parse/sync';
import path  from 'path';
import fs from 'fs';


const index = new UpstashIndex({
    url: process.env.UPSTASH_VECTOR_REST_URL as string,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
 })

 type Record = {
  id:string,
  text:string,
  prediction:string,
  prediction_agent:string,
  annotation:string,
  annotation_agent:string,
  multi_label:string,
  explanation:string,
  status:string,
  event_timestamp:string,
  metadata:string,
  metrics:string
 }
export async function indexHotelData() {
    const csvPath = path.join(process.cwd(), 'src/dataset/montreal_reviews.csv')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    const records:Record[] = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    })

    for (const review of records) {
    try {
        await index.upsert({
          id: review.id, 
          data: review.text, 
          metadata: {
            prediction: review.prediction,
            prediction_agent: review.prediction_agent,
            annotation: review.annotation,
            annotation_agent: review.annotation_agent,
            multi_label: review.multi_label,
            explanation: review.explanation,
            status: review.status,
            event_timestamp: review.event_timestamp,
            metadata: review.metadata,
            metrics: review.metrics,
          },
        })
      } catch (error) {
        console.error(error)
      }
    }
}

indexHotelData()

