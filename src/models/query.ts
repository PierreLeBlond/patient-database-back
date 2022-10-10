import ajv from 'ajv';
import schema from './query.json';

const validator = new ajv();
const validate = validator.compile(schema);

export { validate, schema };
