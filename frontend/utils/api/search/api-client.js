/**
 * Search API Client for Insurance Customer Service
 * Follows the Next.js API Route Proxy Pattern from API_ROUTING_FIX.md
 * 
 * IMPORTANT: Use /api as base URL (Next.js proxy pattern)
 * This points to Next.js API routes, NOT the backend directly
 */

// Base URL points to Next.js API routes (proxy pattern)
const API_BASE_URL = "/api";

class SearchAPIClient {
  /**
   * Search for FAQ answers based on transcription
   * @param {string} transcript - The transcribed audio text
   * @returns {Promise<Object>} Search results with answer
   */
  static async searchFAQ(transcript) {
    try {
      console.log("📤 SearchAPIClient.searchFAQ called with:", transcript);
      
      // Call Next.js proxy route
      // Browser calls: /api/textSearch
      // Next.js proxies to: ${INTERNAL_API_URL}/textSearch
      const response = await fetch(`${API_BASE_URL}/textSearch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to search FAQ: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log("✅ SearchAPIClient.searchFAQ result:", result);
      return result;
    } catch (error) {
      console.error('❌ SearchAPIClient.searchFAQ error:', error);
      throw error;
    }
  }

  /**
   * Health check for the search API
   * @returns {Promise<Object>} Health status
   */
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/textSearch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: 'health check' }),
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status
      };
    } catch (error) {
      console.error('❌ SearchAPIClient health check failed:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

export default SearchAPIClient;