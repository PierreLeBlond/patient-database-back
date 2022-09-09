"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const client = new elasticsearch_1.Client({
    cloud: {
        id: process.env.ELASTICSEARCH_CLOUDID
    },
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    }
});
const jsonParser = body_parser_1.default.json();
app.use((_, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.get('/patient/:id', (request, response, next) => {
    client.get({
        index: 'patients',
        id: request.params.id,
    }).catch((error) => next(error))
        .then((res) => response.send(res._source));
});
app.delete('/patient/:id', (request, response, next) => {
    client.delete({
        index: 'patients',
        id: request.params.id,
        refresh: true // Not optimal : https://github.com/elastic/elasticsearch/issues/7761
    }).catch((error) => next(error))
        .then(() => response.send({ success: true }));
});
app.post('/patients', jsonParser, (request, response, next) => {
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
app.get('/patients', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = request.query;
    const query = search || "";
    // https://stackoverflow.com/questions/51849598/elasticsearch-wild-card-query-not-working
    const lowerCaseQuery = query.toLowerCase();
    // Not optimal : https://stackoverflow.com/questions/16933800/elasticsearch-how-to-use-multi-match-with-wildcard
    const res = yield client.search({
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
    response.send(res.hits.hits.map(hit => ({
        data: hit._source,
        id: hit._id
    })));
}));
app.listen(process.env.PORT);
