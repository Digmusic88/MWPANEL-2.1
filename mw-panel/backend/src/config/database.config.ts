import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const url = process.env.DATABASE_URL;
  
  if (url) {
    // Parse DATABASE_URL if provided
    const dbUrl = new URL(url);
    return {
      type: 'postgres',
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10) || 5432,
      username: dbUrl.username,
      password: dbUrl.password,
      name: dbUrl.pathname.slice(1),
    };
  }
  
  // Use individual env variables
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'mwpanel',
    password: process.env.DB_PASSWORD || 'mwpanel123',
    name: process.env.DB_NAME || 'mwpanel',
  };
});