import _ from 'lodash';

/**
 * Compare the reference counts fetched from BlobStorage to the ones that we recounted.
 * @param storedCounts The counts that were fetched from BlobStorage.
 * @param recounts The complete recounts.
 * @param callback A function that is called for each reference count mismatch.
 */
export function compareCounts(storedCounts, recounts, callback) {
  const definitionsCount = _.reduce(storedCounts, countByRef, {});
  const allReferencesCount = _.reduce(recounts, countByRef, {});

  const allBlobIds = [
    ...Object.keys(definitionsCount),
    ...Object.keys(allReferencesCount),
  ];

  for (const blobStorageID of _.uniq(allBlobIds)) {
    const definitionCount = definitionsCount[blobStorageID] ?? 0;
    const referenceCount = allReferencesCount[blobStorageID] ?? 0;

    if (definitionCount !== referenceCount) {
      callback(blobStorageID, definitionCount, referenceCount);
    }
  }
}

function countByRef(acc, {BlobID, count}) {
  acc[BlobID] ??= 0;
  acc[BlobID] += count;
  return acc;
}
