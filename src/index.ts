import { Client } from '@elastic/elasticsearch';
import { GetResponse, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const client = new Client({
  cloud: {
    id: process.env.ELASTICSEARCH_CLOUDID as string
  },
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME as string,
    password: process.env.ELASTICSEARCH_PASSWORD as string
  }
});

const jsonParser = bodyParser.json();

app.use((_, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/patient-database/patient/:id', (request, response, next) => {
  client.get({
    index: 'patients',
    id: request.params.id,
  }).catch((error) => next(error))
    .then((res) => response.send((res as GetResponse)._source));
});

app.delete('/patient-database/patient/:id', (request, response, next) => {
  client.delete({
    index: 'patients',
    id: request.params.id,
    refresh: true // Not optimal : https://github.com/elastic/elasticsearch/issues/7761
  }).catch((error) => next(error))
    .then(() => response.send({ success: true }));
})

app.post('/patient-database/patients', jsonParser, (request, response, next) => {
  const { firstName, lastName } = request.body;

  if (typeof firstName != "string") {
    throw new Error(`firstName '${firstName}' should be a string`);
  }

  if (typeof lastName != "string") {
    throw new Error(`lastName '${lastName}' should be a string`);
  }

  const regex = /^[A-Za-z][A-Za-z -]+$/;
  if (!firstName.match(regex)) {
    throw new Error(`firstName '${firstName}' is not matching '${regex}'`);
  }
  if (!lastName.match(regex)) {
    throw new Error(`lastName '${lastName}' is not matching '${regex}'`);
  }

  client.index({
    index: 'patients',
    document: {
      firstName,
      lastName
    },
    refresh: true // Not optimal : https://github.com/elastic/elasticsearch/issues/7761
  })
    .catch((error) => next(error))
    .then(() => response.send({ success: true }));
});

app.get('/patient-database/patients', async (request, response, next) => {
  const { search } = request.query;
  const query: string = search as string || "";
  // https://stackoverflow.com/questions/51849598/elasticsearch-wild-card-query-not-working
  const lowerCaseQuery = query.toLowerCase();
  // Not optimal : https://stackoverflow.com/questions/16933800/elasticsearch-how-to-use-multi-match-with-wildcard
  const res = await client.search({
    index: 'patients',
    query: {
      query_string: {
        query: `*${lowerCaseQuery}*`,
        fields: ["firstName", "lastName"],
      }
    }
  }).catch((error) => next(error));

  if (!res) {
    response.send([]);
    return;
  }

  response.send((res as SearchResponse).hits.hits.map(hit => ({
    data: hit._source,
    id: hit._id
  })));
})

app.listen(process.env.PORT);
