import {QueryBuilder} from '../query/queryBuilder.mjs';
import {QueryRangeCollection} from '../query/queryRange.mjs';

/**
 * Compute a partition of independent and balanced BlobStorageID ranges. This enables us to then run consistency checks in parallel on each of them.
 * This is required because BlobStorageIDs are sparse as they can be deleted from the BlobStorage table.
 *
 * For example the BlobStorageID range [10 000, 30 000] could potentially be very sparse and only contain two rows, and at the same time [9 500, 9 600] could be dense and contain 100 rows (!).
 * Precomputing balanced ranges makes sure that consistency checks run on a similar number of rows.
 *
 *
 * @param dbc An instance of DataBaseConnector. It is used to run the query that calculates the optimal ranges.
 * @param rangeSize The number of rows that a given range should encompass.
 * @returns {Promise<QueryRangeCollection>}
 */
export async function buildQueryRanges(dbc, rangeSize) {
  const q = QueryBuilder.QueryRanges(rangeSize);

  return dbc.queryGlobal(q).then((result) => {
    const blobIDs = result[0][2].map((r) => r.BlobID);
    return new QueryRangeCollection(blobIDs);
  });
}

/**
 * Fetch the BlobStorageID reference counts that are stored in the NumReferences field of BlobStorage.
 *
 * @param dbc An instance of DataBaseConnector.
 * @param qb An instance of QueryBuilder.
 */
export async function fetchStoredCounts(dbc, qb) {
  return dbc.queryGlobal(qb.StoredReferenceCounts()).then((r) => r[0][1]);
}

/**
 * Recount the BlobStorageID references in a table from the ground up.
 * @param dbc An instance of DataBaseConnector.
 * @param qb An instance of QueryBuilder.
 * @param dbName The name of the database to run the recount on.
 * @param table The table to run the recount on.
 * @param blobIdField The name of the BlobStorageId field in the table.
 * @returns {Promise<any>}
 */
export async function recount(dbc, qb, dbName, table, blobIdField) {
  return dbc
    .query(dbName, qb.RecountReferences(table, blobIdField))
    .then((r) => r[0][1]);
}

/**
 * Recount the BlobStorageID references of all the tables from the ground up.
 * @param dbc
 * @param qb
 * @param dbChecks
 * @returns {Promise<*[]>}
 */
export async function recountAll(dbc, qb, dbChecks) {
  const allResults = [];

  for (const [dbName, checks] of Object.entries(dbChecks)) {
    for (const check of checks) {
      const [table, blobIdField] = check.split('.');
      const rows = await recount(dbc, qb, dbName, table, blobIdField);

      allResults.push(...rows);
    }
  }

  return allResults;
}
