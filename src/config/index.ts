import dotenv from "dotenv";

dotenv.config();

type Config = {
  port: number;
  databaseUrl: string;
};

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || "",
};

export default config;
