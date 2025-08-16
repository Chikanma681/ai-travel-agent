import { tool } from "ai";
import { z } from "zod";
import { tokenManager } from "../tokenManager.ts";
import { searchMontrealHotels } from "./rag/query.ts";

// @ts-ignore
export const findFlight = tool({
  description: "Finds flight offers based on search criteria using Amadeus API.",
  inputSchema: z.object({
    originLocationCode: z
      .string()
      .describe("Origin city/airport IATA code (e.g., YEG). If the user says Edmonton, assume YEG."),
    destinationLocationCode: z
      .string()
      .describe("Destination city/airport IATA code (e.g., YYC). If the user says Calgary, assume YYC."),
    departureDate: z
      .string()
      .describe("Departure date in YYYY-MM-DD format. If someone says Feb 25, assume the present year (e.g., 2025-02-25)."),
    maxPrice: z.number().optional().describe("Maximum price per traveler"),
  }),
  execute: async ({ originLocationCode, destinationLocationCode, departureDate, maxPrice }) => {
    const searchParams = new URLSearchParams();
    searchParams.append("originLocationCode", originLocationCode);
    searchParams.append("destinationLocationCode", destinationLocationCode);
    searchParams.append("departureDate", departureDate);
    searchParams.append("adults", "1");
    if (maxPrice) searchParams.append("maxPrice", maxPrice.toString());

    try {
      const token = await tokenManager.getValidToken();
      const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", response.status, errorData);
        return { error: `API returned ${response.status}: ${errorData}` };
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return { error: "Failed to fetch flight data" };
    }
  },
});

export const searchHotels = tool({
  description: "Search for information about hotels in Montreal based on guest reviews and experiences",
  inputSchema: z.object({
    query: z.string().describe("What the user wants to know about Montreal hotels (e.g., 'best hotels', 'hotel amenities', 'hotel experiences', 'food quality')"),
  }),
  execute: async ({ query }) => {
    try {
      const results = await searchMontrealHotels(query, 5);

      if (!results || results.length === 0) {
        return "I couldn't find any relevant hotel information for your query.";
      }

      const hotelInfo = results.map((result) => {
        let rating = "Unknown";
        const predictionStr = result.metadata?.prediction as string;

        if (predictionStr && predictionStr.includes("'label': '")) {
          const parts = predictionStr.split("'label': '");
          if (parts.length > 1) {
            rating = parts[1].charAt(0);
          }
        }

        const reviewText = result.data || "";

        return {
          rating: `${rating}/5`,
          review: reviewText.substring(0, 400) + (reviewText.length > 400 ? "..." : ""),
          relevance: result.score?.toFixed(3),
        };
      });

      return hotelInfo;
    } catch (error) {
      console.error("Hotel search error:", error);
      return "Sorry, I encountered an error while searching for hotel information.";
    }
  },
});