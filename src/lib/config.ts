// Fallback secret for static build workers / dev mode if JWT_SECRET is not yet injected
const DEFAULT_SECRET = 'e7f3c98491823ab6c5d9f0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1';

const rawSecret = process.env.JWT_SECRET || DEFAULT_SECRET;

export const JWT_SECRET = new TextEncoder().encode(rawSecret);
