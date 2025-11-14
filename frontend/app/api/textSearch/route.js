/**
 * Text Search API Route
 * Proxies requests to insurance customer service backend for FAQ search
 * Follows the Next.js API Route Proxy Pattern documented in API_ROUTING_FIX.md
 */

export async function POST(request) {
  console.log("🔍 Text Search API route called");
  
  try {
    // Get request body
    const body = await request.json();
    console.log("📝 Request body:", body);
    
    // Get backend URL from environment (server-side only)
    // This env var is NOT available to the browser
    const backendUrl = process.env.INTERNAL_API_URL || 
                       process.env.NEXT_PUBLIC_API_URL || 
                       "http://localhost:8000";
    
    console.log(`🔗 Proxying POST request to: ${backendUrl}/textSearch`);
    
    // Forward request to backend
    const response = await fetch(`${backendUrl}/textSearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`📡 Backend response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      console.error("❌ Backend error:", error);
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Backend response data:", data);
    return Response.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return Response.json(
      { error: 'Failed to connect to backend', details: error.message },
      { status: 500 }
    );
  }
}