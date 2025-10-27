export default () => {
  const isDevelopment = process.env.NODE_ENV !== 'test';
  const envFile = `.env.${process.env.NODE_ENV || 'local'}`;

  if (isDevelopment) {
    console.log('\n=== Configuration Debug ===');
    console.log('📂 Loading from:', envFile);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV || 'local (default)');
    console.log(
      '🗄️ DATABASE_URL:',
      process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing',
    );
    console.log(
      '🔐 JWT_ACCESS_SECRET:',
      process.env.JWT_ACCESS_SECRET ? '✅ Loaded' : '❌ Missing',
    );
    console.log(
      '🔐 JWT_REFRESH_SECRET:',
      process.env.JWT_REFRESH_SECRET ? '✅ Loaded' : '❌ Missing',
    );
    console.log('===========================\n');
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'local',
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
      url: process.env.DATABASE_URL,
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    hasher: {
      round: process.env.BCRYPT_ROUNDS,
    },
    cookie: {
      refreshCookieName: process.env.REFRESH_COOKIE_NAME,
      refreshCookieSecret: process.env.REFRESH_COOKIE_SECRET,
      refreshCookieSameSite: process.env.REFRESH_COOKIE_SAMESITE,
    },
  };
};
