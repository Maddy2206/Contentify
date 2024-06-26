/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:dy6WQHrnSUt9@ep-tight-bonus-a5i5yk8s.us-east-2.aws.neon.tech/AI-content-creation?sslmode=require',
    }
  };