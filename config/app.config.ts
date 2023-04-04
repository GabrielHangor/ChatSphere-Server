export default () => ({
  environment: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
