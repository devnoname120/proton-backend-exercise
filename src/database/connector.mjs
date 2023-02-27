import mysql from 'mysql2/promise';

export class DatabaseConnector {
  constructor(databases) {
    this.databases = databases;
    this.dbConnections = {};
  }

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

  async query(dbName, q) {
    return this.dbConnections[dbName].query(q);
  }

  async queryGlobal(q) {
    return this.dbConnections['ProtonMailGlobal'].query(q);
  }
}
