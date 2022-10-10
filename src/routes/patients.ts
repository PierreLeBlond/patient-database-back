import express from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { Patient } from '../models/Patient';
import { sequelize } from '../config/db';
import { QueryTypes } from 'sequelize';

const patients = express.Router();

patients.get('/', asyncHandler(async (req, res) => {
  const search = (req.query.search as string)?.toLowerCase() ?? "";

  const rows = await Patient.findAll({
    order: [
      ["date", "ASC"],
      ["file", "ASC"]
    ]
  });

  const patients = rows.filter((row: any) => row.firstname.toLowerCase().includes(search) || row.lastname.toLowerCase().includes(search)).map((row: any) => {
    const { id } = row;
    delete row.id;
    return {
      patient: row,
      id
    }
  });
  res.status(200).json({ status: 200, data: { patients } });
}));

patients.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rows = await sequelize.query('SELECT * FROM (SELECT *, LAG(id) over (ORDER BY date, file) as previous_id, LEAD(id) over (ORDER BY date, file) as next_id FROM patients) AS t WHERE id = ?;', {
    type: QueryTypes.SELECT,
    replacements: [id]
  });

  const patient = rows[0] as any;

  const previousId = patient.previous_id;
  const nextId = patient.next_id;

  // const patient = await Patient.findByPk(id, {
  // attributes: {
  // exclude: ['id']
  // }
  // }) as any;

  const data = {
    patient,
    previousId,
    nextId,
    id
  };

  res.status(200).json({ status: 200, data });
}));

patients.post('/', asyncHandler(async (req, res) => {

  const { patient } = req.body;

  patient.id = crypto.randomUUID();

  await Patient.create(patient);

  res.status(201).json({ status: 201, message: 'Succesfully added new patient.' });
}));

patients.post('/:id', asyncHandler(async (req, res) => {
  const patient = req.body;

  await Patient.update(patient, {
    where: {
      id: req.params.id
    }
  });

  res.status(201).json({ status: 201 });
}));

patients.delete('/:id', asyncHandler(async (req, res) => {
  await Patient.destroy({
    where: {
      id: req.params.id
    }
  });

  res.status(201).json({ status: 201 });
}));

export { patients };