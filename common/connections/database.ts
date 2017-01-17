import * as knex from 'knex';

const config = require('../../config/database.config.json');
const knexInstance = knex(config);

export {
    knexInstance as dbInstance
}