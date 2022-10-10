import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
  logging: false
});

const init = async () => {
  await sequelize.authenticate();
};

export { sequelize, init };
