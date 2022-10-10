import express from 'express';
import asyncHandler from 'express-async-handler';
import { sequelize } from '../config/db';
import { Patient } from '../models/Patient';

const stats = express.Router();

stats.get('/', asyncHandler(async (req, res) => {
  const count = await Patient.count({
    where: req.query
  });

  res.status(200).json({ status: 200, data: { count } });
}));

stats.get('/:attributes', asyncHandler(async (req, res) => {
  const { attributes } = req.params;
  const result = await Patient.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col(attributes)), 'total']
    ],
    where: req.query
  });

  res.status(200).json({ status: 200, data: result });
}))

export { stats };
