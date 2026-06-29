/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ensure the generated vector index is bundled into the serverless function
    // (e.g. on Vercel) so the chat API route can read it at runtime.
    outputFileTracingIncludes: {
      "/api/chat": ["./data/vector-index.json"],
    },
  },
};

export default nextConfig;
