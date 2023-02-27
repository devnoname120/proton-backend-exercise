export class QueryBuilder {
  constructor(queryRange) {
    this.queryRange = queryRange;
  }

  static ChunkRanges(chunkSize) {
    return `
      SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

      SELECT 0 INTO @row;

      SELECT @row := @row +1 AS rownum, BlobStorageID as BlobID
      FROM ProtonMailGlobal.BlobStorage
      HAVING (rownum-1) % ${chunkSize + 1} = 0
      ORDER BY BlobStorageID;
    `;
  }

  StoredReferenceCounts() {
    const {minId, maxId} = this.queryRange;

    return `
    SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

    SELECT BlobStorageID as BlobID, NumReferences as count
    FROM ProtonMailGlobal.BlobStorage
    WHERE ${minId} <= BlobStorageID AND BlobStorageID < ${maxId}
    ORDER BY BlobStorageID;
  `;
  }

  RecountReferences(table, idField) {
    const {minId, maxId} = this.queryRange;

    return `
    SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

    SELECT ${idField} as BlobID, COUNT(1) as count
    FROM ${table} FORCE INDEX (${idField})
    WHERE ${minId} <= ${idField} AND ${idField} < ${maxId}
    GROUP BY ${idField}
    ORDER BY ${idField}
  `;
  }
}
