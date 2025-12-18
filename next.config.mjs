import createMDX from 'fumadocs-mdx/config';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: ''
      },
      {
        protocol: 'http', 
        hostname: '127.0.0.1', 
        port: '64321'
      },
      {
        protocol: 'https',
        hostname: 'llmgwifgtszjgjlzlwjq.supabase.co',
        port: ''
      }
    ]
  }
};

export default withPWA(withMDX(config));
