'use strict'

const knex = require('knex');
const knexConfigs = require('./knexfile.js');
const dotenv = require('dotenv');

dotenv.config();
const knexConfig = knexConfigs[process.env.NODE_ENV]

const dbClient = knex(knexConfig)

module.exports = { dbClient };