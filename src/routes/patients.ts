import express from 'express';
import asyncHandler from 'express-async-handler';
import { db } from '../config/db';
import { validate } from '../models/patients';
import crypto from 'crypto';

const patients = express.Router();

patients.get('/', asyncHandler(async (req, res) => {
  const search = (req.query.search as string)?.toLowerCase() ?? "";
  const { rows } = await db.query('SELECT * FROM patients ORDER BY date, file;');
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
  const { rows } = await db.query('SELECT * FROM (SELECT *, LAG(id) over (ORDER BY date, file) as previous_id, LEAD(id) over (ORDER BY date, file) as next_id FROM patients) AS t WHERE id = $1;', [req.params.id]);
  const row = rows[0];
  const { previous_id, next_id, id } = row;

  delete row.previous_id;
  delete row.next_id;
  delete row.id;

  const data = {
    patient: row,
    previousId: previous_id,
    nextId: next_id,
    id
  }

  res.status(200).json({ status: 200, data });
}));

patients.post('/', asyncHandler(async (req, res) => {

  const { patient } = req.body;

  validate(patient);

  const properties = [
    crypto.randomUUID(),
    patient.date,
    patient.file,
    patient.aftercare,
    patient.firstname,
    patient.lastname,
    patient.gender,
    patient.year,
    patient.age,
    patient.phone,
    patient.other_ex,
    patient.cataract,
    patient.tear_treatment,
    patient.glasses,
    patient.ar,
    patient.avod_sc,
    patient.avog_sc,
    patient.avod_ac,
    patient.avog_ac,
    patient.avodg_ac,
    patient.laf,
    patient.prescription,
    patient.glasses_donation,
    patient.treatment,
    patient.glasses_holder,
    patient.comment
  ];


  await db.query('INSERT INTO patients (id, date, file, aftercare, firstname, lastname, gender, year, age, phone, other_ex, cataract, tear_treatment, glasses, ar, avod_sc, avog_sc, avod_ac, avog_ac, avodg_ac, laf, prescription, glasses_donation, treatment, glasses_holder, comment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)', properties);

  res.status(201).json({ status: 201, message: 'Succesfully added new patient.' });
}));

patients.post('/:id', asyncHandler(async (req, res) => {
  const patient = req.body;
  validate(patient);

  const properties = [
    patient.date,
    patient.file,
    patient.aftercare,
    patient.firstname,
    patient.lastname,
    patient.gender,
    patient.year,
    patient.age,
    patient.phone,
    patient.other_ex,
    patient.cataract,
    patient.tear_treatment,
    patient.glasses,
    patient.ar,
    patient.avod_sc,
    patient.avog_sc,
    patient.avod_ac,
    patient.avog_ac,
    patient.avodg_ac,
    patient.laf,
    patient.prescription,
    patient.glasses_donation,
    patient.treatment,
    patient.glasses_holder,
    patient.comment,
    req.params.id
  ];

  await db.query('UPDATE patients SET date = $1, file = $2, aftercare = $3, firstname = $4, lastname = $5, gender = $6, year = $7, age = $8, phone = $9, other_ex = $10, cataract = $11, tear_treatment = $12, glasses = $13, ar = $14, avod_sc = $15, avog_sc = $16, avod_ac = $17, avog_ac = $18, avodg_ac = $19, laf = $20, prescription = $21, glasses_donation = $22, treatment = $23, glasses_holder = $24, comment = $25 WHERE id = $26', properties);

  res.status(201).json({ status: 201 });
}));

patients.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM patients WHERE id = $1;', [req.params.id]);

  res.status(201).json({ status: 201 });
}));

export { patients };