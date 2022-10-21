import express from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { Act, Patient } from '../models/Patient';
import { sequelize } from '../config/db';
import { QueryTypes } from 'sequelize';

const patients = express.Router();

patients.get('/', asyncHandler(async (req, res) => {
  const search = (req.query.search as string)?.toLowerCase() ?? "";

  const patients = await Patient.findAll({
    order: [
      ["date", "ASC"],
      ["file", "ASC"]
    ]
  });

  const filteredPatients = patients.filter((row: any) => row.firstname.toLowerCase().includes(search) || row.lastname.toLowerCase().includes(search));
  res.status(200).json({ status: 200, data: { patients: filteredPatients } });
}));

patients.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rows = await sequelize.query(`
  SELECT * FROM (
    SELECT id, LAG(id) over (ORDER BY date, file) as previous_id, LEAD(id) over (ORDER BY date, file) as next_id
    FROM patients
  ) as t WHERE id = ?;
  `, {
    type: QueryTypes.SELECT,
    replacements: [id]
  });

  const { previous_id, next_id } = rows[0] as any;

  const patient = await Patient.findByPk(id, {
    include: 'acts'
  });

  const data = {
    patient,
    previousId: previous_id,
    nextId: next_id
  };

  res.status(200).json({ status: 200, data });
}));

patients.post('/', asyncHandler(async (req, res) => {

  const patient = req.body;

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

patients.post('/:patient/acts', asyncHandler(async (req, res) => {
  const { patient } = req.params;
  const act = req.body;

  const createdAct = await Act.create({
    patient_id: patient,
    ...act
  });

  const data = {
    act: createdAct
  };

  res.status(201).json({ status: 201, message: 'Succesfully added new act.', data });
}));

patients.post('/:patient/acts/:act', asyncHandler(async (req, res) => {
  const act = req.body;

  const updatedAct = await Act.update(act, {
    where: {
      id: req.params.act
    }
  });

  const data = {
    act: updatedAct
  };

  res.status(201).json({ status: 201, message: 'Succesfully added new act.', data });
}));

patients.delete('/:id', asyncHandler(async (req, res) => {
  await Patient.destroy({
    where: {
      id: req.params.id
    }
  });

  res.status(201).json({ status: 201 });
}));

patients.delete('/:patient/acts/:act', asyncHandler(async (req, res) => {
  await Act.destroy({
    where: {
      id: req.params.act
    }
  });

  res.status(201).json({ status: 201 });
}));

export { patients };