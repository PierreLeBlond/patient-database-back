import express from 'express';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import { sequelize } from '../config/db';
import { validate } from '../models/users';
import { QueryTypes } from 'sequelize';

const users = express.Router();

users.get('/', asyncHandler(async (req, res) => {
  const users = await sequelize.query('SELECT username FROM users;', {
    type: QueryTypes.SELECT,
  });
  res.status(200).json({ status: 200, data: { users } });
}));

users.post('/', asyncHandler(async (req, res) => {
  const user = req.body;

  validate(user);

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);

  await sequelize.query(`INSERT INTO users (username, password) VALUES (?, ?);`, {
    type: QueryTypes.SELECT,
    replacements: [user.username, hashedPassword]
  })

  res.status(201).send({ status: 201, message: `Successfully created user ${user.username}` });
}));

export { users };