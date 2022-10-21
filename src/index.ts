import express from 'express';
import dotenv from 'dotenv';
import { patients } from './routes/patients';
import { stats } from './routes/stats';
import { users } from './routes/users';
import { login } from './routes/login';
import { init } from './config/db';
import { authenticate } from './controllers/authenticate';
import { Patient } from './models/Patient';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((_, res, next) => {
  // TODO Allow only from front site
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

init().then(async () => {
  console.log('Connected to db!');

  app.use('/login', login)

  app.use(authenticate);

  app.use('/users', users)
  app.use('/patients', patients)
  app.use('/stats', stats)

  app.listen(port)
}).catch((err) => {
  console.error('Couldnt connect to db:', err);
});