/**
 * Vercel Edge Function for health checks and service information
 * Accessible at /api/health
 */

export default async function handler(request) {
  const url = new URL(request.url);

  // Basic service information
  const serviceInfo = {
    service: 'Xget',
    version: '1.0.0',
    platform: 'Vercel Edge Functions',
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 'N/A',
    regions: ['iad1', 'hnd1', 'fra1', 'sfo1'],
    endpoints: {
      health: '/api/health',
      root: '/',
      proxy: '/{platform}/{path}'
    },
    supported_platforms: [
      'GitHub (gh)',
      'GitLab (gl)',
      'Gitea',
      'Codeberg',
      'SourceForge (sf)',
      'Hugging Face (hf)',
      'npm',
      'PyPI',
      'conda',
      'Maven',
      'Apache',
      'Gradle',
      'Homebrew',
      'RubyGems',
      'CRAN',
      'CPAN',
      'CTAN',
      'Go modules',
      'NuGet',
      'Rust crates',
      'Packagist',
      'Container Registries',
      'AI Inference Providers',
      'arXiv',
      'F-Droid'
    ]
  };

  // Add request information for debugging
  if (url.searchParams.get('debug') === 'true') {
    serviceInfo.request_info = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      cf: request.cf || 'Not available on Vercel',
      user_agent: request.headers.get('User-Agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
    };
  }

  return new Response(JSON.stringify(serviceInfo, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      'X-Service': 'Xget-Vercel',
      'X-Powered-By': 'Vercel Edge Functions'
    }
  });
}

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'hnd1', 'fra1', 'sfo1']
};
