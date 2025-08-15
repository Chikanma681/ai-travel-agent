export class AmadeusTokenManager {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;
    
    private async refreshToken(): Promise<string> {
      const apiKey = process.env.AMADEUS_API_KEY;
      const apiSecret = process.env.AMADEUS_API_SECRET;
      if (!apiKey || !apiSecret) {
        throw new Error("Amadeus API credentials are not set in environment variables.");
      }

      const response = await fetch(`https://test.api.amadeus.com/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_API_KEY!}&client_secret=${process.env.AMADEUS_API_SECRET!}`
      });

  
      const data = await response.json();
      console.log("data", data)
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${data}`);
      }
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early
      
      return this.accessToken;
    }
  
    async getValidToken(): Promise<string> {
      if (!this.accessToken || Date.now() >= this.tokenExpiry) {
        return await this.refreshToken();
      }
      return this.accessToken;
    }
  }
  
export const tokenManager = new AmadeusTokenManager();