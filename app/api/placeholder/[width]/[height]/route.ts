import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  try {
    const { width: widthParam, height: heightParam } = await params;
    const width = parseInt(widthParam);
    const height = parseInt(heightParam);

    // Validate dimensions
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width > 3000 || height > 3000) {
      return new Response('Invalid dimensions', { status: 400 });
    }

    // Generate a simple SVG placeholder image
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
        
        <!-- Mountain silhouette -->
        <path d="M0,${height * 0.6} L${width * 0.25},${height * 0.3} L${width * 0.4},${height * 0.4} L${width * 0.6},${height * 0.2} L${width * 0.75},${height * 0.35} L${width},${height * 0.5} L${width},${height} L0,${height} Z" 
              fill="white" 
              opacity="0.2"/>
        
        <!-- Text -->
        <text x="${width / 2}" y="${height / 2}" 
              font-family="Arial, sans-serif" 
              font-size="${Math.min(width, height) * 0.08}" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle"
              opacity="0.8">
          ${width} × ${height}
        </text>
      </svg>
    `;

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
