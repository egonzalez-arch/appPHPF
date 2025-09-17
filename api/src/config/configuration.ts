export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
  },

  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    },
  },

  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASS || 'password',
    database: process.env.DATABASE_NAME || 'phpf_db',
    logging: process.env.TYPEORM_LOGGING === 'true',
    synchronize: false, // Disabled for future migrations
  },
});
