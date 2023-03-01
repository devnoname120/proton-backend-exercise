import mysql from 'mysql2/promise';

/**
 * Database wrapper that abstracts out the creation of database connections.
 * It the future, a pooled database connections can be added to seamlessly perform queries in parallel.
 */
export class DatabaseConnector {
  constructor(databases) {
    this.databases = databases;
    this.dbConnections = {};
  }

  /**
   * This method needs to be called prior to using the DatabaseConnector
   */
  async init() {
    for (const [database, {config}] of Object.entries(this.databases)) {
      const {host, port, user, password} = config;
      this.dbConnections[database] = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
        decimalNumbers: true,
        multipleStatements: true,
      });
    }
  }

  async finish() {
    for (const conn of Object.values(this.dbConnections)) {
      await conn.end();
    }
  }

  /**
   * Perform a database query.
   * @param dbName The name of the database to perform the query on
   * @param q A query returned by a QueryBuilder
   */
  async query(dbName, q) {
    return this.dbConnections[dbName].query(q);
  }

  /**
   * Perform a query on the global database.
   * @param q A query returned by a QueryBuilder
   */
  async queryGlobal(q) {
    return this.query('ProtonMailGlobal', q);
  }
}
