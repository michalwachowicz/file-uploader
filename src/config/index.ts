import dotenv from "dotenv";

dotenv.config();

type Config = {
  port: number;
  databaseUrl: string;
  sessionSecret: string;
};

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || "",
  sessionSecret: process.env.SESSION_SECRET || "",
};

export default config;
