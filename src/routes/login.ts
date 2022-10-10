import express from 'express';
import asyncHandler from 'express-async-handler';
import { sequelize } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';

const login = express.Router();

const generateAccessToken = (username: string) => {
  return jwt.sign({ username }, process.env.JWT_ACCESS_TOKEN as string, { expiresIn: '1h' });
};

login.post('/', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const rows = await sequelize.query(`SELECT * FROM users WHERE username = ?;`, {
    type: QueryTypes.SELECT,
    replacements: [username]
  });
  const user = rows[0] as any;

  if (!user) {
    throw new Error('Incorrect username or password')
  }

  const same = await bcrypt.compare(password, user.password);

  if (!same) {
    throw new Error('Incorrect username or password')
  }

  const accessToken = generateAccessToken(username);
  res.status(201).json({
    status: 201, data: {
      accessToken
    }
  });
}));

export { login };