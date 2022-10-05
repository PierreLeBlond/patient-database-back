import ajv from 'ajv';

const schema = {
  "title": "User",
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "maxLength": 64,
      "pattern": "^[A-Za-z][A-Za-z -]+$"
    },
    "password": {
      "type": "string",
      "maxLength": 64,
      "pattern": "^[A-Za-z0-9#?!@$ %^&*-]+$"
    }
  }
};

const validator = new ajv();

const validate = validator.compile(schema);

export { validate };