/** @type {import('next').NextConfig} */
const nextConfig = {
  // 키오스크 최적화 설정
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // 이미지 최적화 설정
  images: {
    unoptimized: true, // 키오스크 환경에서 정적 이미지 사용
  },
  
  // 출력 설정
  output: 'standalone',
  
  // 압축 설정
  compress: true,
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
