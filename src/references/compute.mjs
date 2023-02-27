import {QueryBuilder} from '../query/queryBuilder.mjs';
import {QueryRangeCollection} from '../query/queryRange.mjs';

export async function buildChunkRanges(dbc, chunkSize) {
  const q = QueryBuilder.ChunkRanges(chunkSize);

  return dbc.queryGlobal(q).then((result) => {
    const blobIDs = result[0][2].map((r) => r.BlobID);
    return new QueryRangeCollection(blobIDs);
  });
}

export async function fetchStoredCounts(dbc, qb) {
  return dbc.queryGlobal(qb.StoredReferenceCounts()).then((r) => r[0][1]);
}

export async function recount(dbc, dbName, table, qb, blobIdField) {
  return dbc
    .query(dbName, qb.RecountReferences(table, blobIdField))
    .then((r) => r[0][1]);
}

export async function recountAll(dbc, qb, dbChecks) {
  const allResults = [];

  for (const [dbName, checks] of Object.entries(dbChecks)) {
    for (const check of checks) {
      const [table, blobIdField] = check.split('.');
      const rows = await recount(dbc, dbName, table, qb, blobIdField);

      allResults.push(...rows);
    }
  }

  return allResults;
}
