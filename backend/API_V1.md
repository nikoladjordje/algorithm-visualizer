# Algorithm Trace API v1

API v1 is a supported, sorting-only compatibility contract. It does not expose graph algorithms.
New family-aware clients should use [API v2](./API_V2.md).

## Routes

- `GET /api/v1/algorithms` lists the six sorting algorithms in catalog order.
- `POST /api/v1/algorithms/{algorithmId}/trace` runs `insertion`, `selection`, `bubble`, `merge`,
  `quick`, or `heap`.

```json
{ "values": [3, 1, 2] }
```

`values` contains 1–50 signed 32-bit integers. A successful response contains `apiVersion: "1.0"`,
algorithm metadata, `inputValues`, aggregate `summary`, advertised `limits`, and ordered semantic
events. Events have a 1-based contiguous `sequence`, `type`, `pseudocodeLineId`, immutable `state`,
`sortedRanges`, and type-specific `data`.

The event vocabulary includes `SELECT`, `READ`, `COMPARE`, `SWAP`, `WRITE`, `MARK_SORTED`, and the
additional pass, merge, partition, minimum, and heap events required by the selected algorithm.
`summary.operationCounts` counts event types and `summary.resultValues` is the final sorted array.
Traces are limited to 10,000 events.

## Errors

Errors use `application/problem+json`. Validation and malformed JSON return HTTP 400 with
`INVALID_INPUT` and `MALFORMED_REQUEST`; unknown algorithms return HTTP 404 with
`ALGORITHM_NOT_FOUND`; trace overflow returns HTTP 422 with `TRACE_LIMIT_EXCEEDED`.

## Migrating to v2

Use `GET /api/v2/algorithms`, send `kind: "SORTING"`, and read the family-specific `input`,
`result`, and event `state` objects. Do not use either removed insertion-only route:

- `POST /api/algorithms/insertion-sort`
- `POST /api/v1/algorithms/insertion-sort`

Both return HTTP 404 through normal routing. There is no redirect or compatibility response.
