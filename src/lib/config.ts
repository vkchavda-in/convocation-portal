if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set in production mode');
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production mode');
  }
}

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-me-dev'
);
