# Algorithm Trace API v1

`POST /api/v1/algorithms/insertion-sort` accepts:

```json
{ "values": [3, 1, 2] }
```

`values` must contain 1–50 signed 32-bit integers. A successful response uses `apiVersion: "1.0"` and separates algorithm metadata, the original input, aggregate `summary`, advertised `limits`, and the ordered `events` array. Each event has a 1-based contiguous `sequence`, a `type`, `pseudocodeLineId`, pass metadata, a complete immutable `state` snapshot, and type-specific `data`.

## Event types

- `SELECT`: identifies the value currently being inserted.
- `READ`: records values read from one or more indices.
- `COMPARE`: records operands and a `LESS`, `EQUAL`, or `GREATER` result.
- `SWAP`: announces the indices about to be exchanged.
- `WRITE`: records the values written after a swap.
- `MARK_SORTED`: marks the inclusive sorted-prefix range.

`summary.operationCounts` contains a count for every event type, while `summary.resultValues` contains the final sorted array. Traces are limited to 10,000 events. Exceeding that limit returns HTTP 422 Problem Details with code `TRACE_LIMIT_EXCEEDED`. Validation and malformed JSON return HTTP 400 with `INVALID_INPUT` and `MALFORMED_REQUEST`, respectively.

The legacy `POST /api/algorithms/insertion-sort` endpoint remains temporarily available and adapts v1 traces to `COMPARE`, `SWAP`, and `PASS_COMPLETE` events. New clients must use the versioned endpoint.
