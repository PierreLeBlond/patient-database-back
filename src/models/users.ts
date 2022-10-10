import ajv from 'ajv';
import schema from './users.json'

const validator = new ajv();

const validate = validator.compile(schema);

export { validate };