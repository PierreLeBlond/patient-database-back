import express from 'express';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import { db } from '../config/db';
import { validate } from '../models/users';

const users = express.Router();

users.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT username FROM users;');
  res.status(200).json({ status: 200, data: { users: rows } });
}));

users.post('/', asyncHandler(async (req, res) => {
  const user = req.body;

  validate(user);

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);

  db.query(`INSERT INTO users (username, password) VALUES ($1, $2);`, [user.username, hashedPassword])
    .then(() => res.status(201).send({ status: 201, message: `Successfully created user ${user.username}` }));
}));

export { users };