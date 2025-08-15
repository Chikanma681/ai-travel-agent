import { tool } from "ai";
import { z } from "zod";
import { tokenManager } from "../tokenManager.ts";
// @ts-ignore
export const findFlight = tool({
    description: "Finds flight offers based on search criteria using Amadeus API.",
    inputSchema: z.object({
        originLocationCode: z.string().describe("Origin city/airport IATA code (e.g., YEG) if the user says Edmonton for example assume YEG)"),
        destinationLocationCode: z.string().describe("Destination city/airport IATA code (e.g., YYC) if the user says Calgary for example assume YYC)"),
        departureDate: z.string().describe("Departure date in YYYY-MM-DD format if someone says Feb 25 assume it is the present year (e.g., 2023-02-25)"),
        maxPrice: z.number().optional().describe("Maximum price per traveler"),
    }),
    execute: async ({ originLocationCode, destinationLocationCode, departureDate, maxPrice }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('originLocationCode', originLocationCode);
        searchParams.append('destinationLocationCode', destinationLocationCode);
        searchParams.append('departureDate', departureDate);
        searchParams.append('adults', '1');
        if (maxPrice) searchParams.append('maxPrice', maxPrice.toString());
      

        try {
          const token = await tokenManager.getValidToken();
          const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
      
          if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error:', response.status, errorData);
            return { error: `API returned ${response.status}: ${errorData}` };
          }
      
          const data = await response.json();
          console.log('API Response:', data); 
          return data;
        } catch (error) {
          console.error('Fetch error:', error);
          return { error: 'Failed to fetch flight data' };
        }
      }
});