/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/meeting', destination: '/', permanent: false }
    ]
  }
}

export default nextConfig
