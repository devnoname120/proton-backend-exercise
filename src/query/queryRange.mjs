export class QueryRange {
  constructor(minId, maxId) {
    this.minId = minId;
    this.maxId = maxId;
  }
}

export class QueryRangeCollection {
  constructor(ranges) {
    this.ranges = ranges;
  }

  *[Symbol.iterator]() {
    // Force the lower boundary of the first range to start at 0
    yield new QueryRange(0, this.ranges[1]);

    for (let left = 2; left < this.ranges.length - 1; left++) {
      const right = left + 1;

      yield new QueryRange(this.ranges[left], this.ranges[right]);
    }

    yield new QueryRange(this.ranges.at(-1), Number.MAX_SAFE_INTEGER);
  }
}
