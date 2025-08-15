import { tool } from "ai";
import { z } from "zod";

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

        const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`, {
            headers: {
                "Authorization": `Bearer ${process.env.AMADEUS_BEARER_TOKEN}`
            }
        });

        const data = await response.json();
        return data;
    }
});