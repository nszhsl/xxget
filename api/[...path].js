/**
 * Vercel Edge Function entry point for Xget
 * Adapts the Cloudflare Worker code to run on Vercel's Edge Runtime
 */

// Import the worker handler directly
import workerHandler from '../src/index.js';

/**
 * Main handler for Vercel Edge Function
 * @param {Request} request - The incoming request
 * @returns {Promise<Response>} The response
 */
export default async function handler(request) {
  try {
    // Create mock environment and context objects for Cloudflare Worker compatibility
    const env = {};
    const ctx = {
      waitUntil: promise => {
        // In Vercel Edge Functions, we don't have waitUntil, so we just ignore it
        // The promise will still execute, but we won't wait for it to complete
      },
      passThroughOnException: () => {
        // Not applicable in Vercel Edge Functions
      }
    };

    // Call the Cloudflare Worker's fetch handler
    return await workerHandler.fetch(request, env, ctx);
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Error': 'true'
        }
      }
    );
  }
}

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'hnd1', 'fra1', 'sfo1'] // Multiple regions for better performance
};
