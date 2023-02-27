import fs from 'fs/promises';
import _ from 'lodash';

export const {ChunkSize, ConcurrentRecounts} = JSON.parse(
  await fs.readFile('config/checker.json', 'utf-8')
);

const dbJson = JSON.parse(await fs.readFile('config/databases.json', 'utf-8'));

export const Databases = _.omit(dbJson, 'checks');
export const Checks = _.mapValues(dbJson, 'checks');
