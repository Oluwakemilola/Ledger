import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const {
    PORT = 5000,
    DB_URL,
    JWT_SECRET,
    NODE_ENV = "development",
} = process.env;