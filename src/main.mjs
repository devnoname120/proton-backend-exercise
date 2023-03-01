import * as Config from './config.mjs';

import {QueryBuilder} from './query/queryBuilder.mjs';
import {DatabaseConnector} from './database/connector.mjs';
import {compareCounts} from './references/compare.mjs';
import {
  recountAll,
  fetchStoredCounts,
  buildQueryRanges,
} from './references/compute.mjs';

const dbc = new DatabaseConnector(Config.Databases);
await dbc.init();

const queryRanges = await buildQueryRanges(dbc, Config.RangeSize);

for (const queryRange of queryRanges) {
  const qb = new QueryBuilder(queryRange);

  const storedCounts = await fetchStoredCounts(dbc, qb);
  const recounts = await recountAll(dbc, qb, Config.Checks);
  compareCounts(storedCounts, recounts, logInconsistencies);
}

await dbc.finish();

function logInconsistencies(blobStorageID, numReferences, numRecounted) {
  console.log(
    `[blobStorageID:${blobStorageID}] NumReferences=${numReferences}, but recount=${numRecounted}`
  );
}
