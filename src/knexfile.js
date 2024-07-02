// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql',
    debug: false,
    connection: {
      host: '127.0.0.1',
      user:     'root',
      password: '1234',
      database: 'sugarbot'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user:     'root',
      password: 'root.oixsooxlolxaobx',
      database: 'sugarbot'
    },
    pool: {
      min: 2,
      max: 10
    }
  }

};
