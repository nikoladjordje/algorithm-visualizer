export type ComparisonResult = 'LESS' | 'EQUAL' | 'GREATER'
export interface TraceItem { id: number; value: number }
export interface SortedRange { fromIndex: number; throughIndex: number }
export type AlgorithmEventType = 'SELECT'|'READ'|'COMPARE'|'SWAP'|'WRITE'|'MARK_SORTED'|'PASS_START'|'PASS_COMPLETE'|'NO_SWAP_COMPLETE'|'MINIMUM_UPDATE'|'SPLIT_RANGE'|'BEGIN_MERGE'|'BUFFER_MOVE'|'COMPLETE_MERGE'|'PIVOT_SELECT'|'PARTITION_ACTIVE'|'PARTITION_COMPLETE'|'BUILD_HEAP'|'ROOT_SELECT'|'HEAPIFY'|'HEAP_SHRINK'
interface BaseEvent { sequence:number; type:AlgorithmEventType; pseudocodeLineId:string; state:(TraceItem|number)[]; sortedRanges?:SortedRange[]; sortedThrough?:number; pass?:number }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AlgorithmEvent = BaseEvent & { data:any }
export interface AlgorithmTrace { apiVersion:'1.0'; algorithm:{id:string;name:string}; inputValues:number[]; summary:{resultValues:number[];eventCount:number;operationCounts:Partial<Record<AlgorithmEventType,number>>};limits:{maxInputItems:number;maxEvents:number};events:AlgorithmEvent[] }
export interface AlgorithmCatalogEntry { id:string;name:string;available:boolean;contractVersion:string;inputConstraints:{maxInputItems:number;maxEvents:number};metricTypes:MetricType[] }
export type MetricType = 'COMPARISONS'|'READS'|'WRITES'|'SWAPS'
export interface ProblemDetail { type:string;title:string;status:number;detail:string;instance:string;code:string }
