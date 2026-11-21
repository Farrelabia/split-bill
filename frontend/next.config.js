module.exports = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    const apiOrigin = process.env.BILL_API_ORIGIN || 'http://127.0.0.1:3000';
    return [{
      source: '/api/bills/:path*',
      destination: `${new URL(apiOrigin).origin}/api/bills/:path*`,
    }];
  },
};
