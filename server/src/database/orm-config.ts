import { DataSourceOptions } from "typeorm";

const config: DataSourceOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [`${__dirname}/models/**/*.ts`],
    migrations: [`${__dirname}/migrations/**/*.ts`],
    logging: true,
    synchronize: true,
}

export default config;