export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
//<<<<<<< HEAD
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'phpf',

//>>>>>>> 682a6194db088fdf4ed6568c9cdc4e16329b99e7
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
  },
  
  auth: {
    enable: process.env.AUTH_ENABLE === 'true',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
});