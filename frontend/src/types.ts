export type ComparisonResult = 'LESS' | 'EQUAL' | 'GREATER'
export interface TraceItem { id: number; value: number }
export interface SortedRange { fromIndex: number; throughIndex: number }
export type AlgorithmEventType = keyof EventDataByType

interface EventDataByType {
  SELECT: { kind: 'SELECT'; index: number; item: TraceItem }
  READ: { kind: 'READ'; indices: number[]; items: TraceItem[] }
  COMPARE: { kind: 'COMPARE'; indices: number[]; items: TraceItem[]; result: ComparisonResult }
  SWAP: { kind: 'SWAP'; indices: number[] }
  WRITE: { kind: 'WRITE'; indices: number[]; items: TraceItem[] }
  MARK_SORTED: { kind: 'MARK_SORTED'; fromIndex: number; throughIndex: number }
  PASS_START: { kind: 'PASS_START'; pass: number; swapped: boolean }
  PASS_COMPLETE: { kind: 'PASS_COMPLETE'; pass: number; swapped: boolean }
  NO_SWAP_COMPLETE: { kind: 'NO_SWAP_COMPLETE'; pass: number; swapped: boolean }
  MINIMUM_UPDATE: { kind: 'MINIMUM_UPDATE'; index: number; item: TraceItem }
  SPLIT_RANGE: { kind: 'SPLIT_RANGE'; fromIndex: number; throughIndex: number }
  BEGIN_MERGE: { kind: 'BEGIN_MERGE'; left: number; middle: number; right: number; buffer: TraceItem[] }
  BUFFER_MOVE: { kind: 'BUFFER_MOVE'; left: number; middle: number; right: number; buffer: TraceItem[] }
  COMPLETE_MERGE: { kind: 'COMPLETE_MERGE'; left: number; middle: number; right: number; buffer: TraceItem[] }
  PIVOT_SELECT: { kind: 'PIVOT_SELECT'; left: number; right: number; scanner: number; boundary: number; pivotIndex: number }
  PARTITION_ACTIVE: { kind: 'PARTITION_ACTIVE'; left: number; right: number; scanner: number; boundary: number; pivotIndex: number }
  PARTITION_COMPLETE: { kind: 'PARTITION_COMPLETE'; left: number; right: number; scanner: number; boundary: number; pivotIndex: number }
  BUILD_HEAP: { kind: 'BUILD_HEAP'; heapSize: number; rootIndex: number; childIndex: number }
  ROOT_SELECT: { kind: 'ROOT_SELECT'; heapSize: number; rootIndex: number; childIndex: number }
  HEAPIFY: { kind: 'HEAPIFY'; heapSize: number; rootIndex: number; childIndex: number }
  HEAP_SHRINK: { kind: 'HEAP_SHRINK'; heapSize: number; rootIndex: number; childIndex: number }
}

interface SortingState { kind: 'SORTING'; items: TraceItem[]; sortedRanges: SortedRange[] }

export type AlgorithmEvent = {
  [Type in AlgorithmEventType]: {
    sequence: number
    type: Type
    pseudocodeLineId: string
    state: SortingState
    data: EventDataByType[Type]
  }
}[AlgorithmEventType]

export interface AlgorithmTrace {
  apiVersion: '2.0'
  algorithm: { id: string; name: string; family: 'SORTING' }
  input: { kind: 'SORTING'; values: number[] }
  result: { kind: 'SORTING'; values: number[] }
  limits: { maximumEvents: number }
  events: AlgorithmEvent[]
}

export interface SortingAlgorithmCatalogEntry {
  id: string
  name: string
  family: 'SORTING'
  contractVersion: '2.0'
  constraints: {
    kind: 'SORTING'
    minimumValues: number
    maximumValues: number
    minimumValue: number
    maximumValue: number
  }
}

export type NodeStatus = 'UNREACHED' | 'DISCOVERED' | 'ACTIVE' | 'PROCESSED'
export interface GraphEdge { from: string; to: string }
export interface GraphTraversalState {
  kind: 'GRAPH_TRAVERSAL'
  nodeStatuses: Record<string, NodeStatus>
  queue: string[]
  traversalOrder: string[]
  parents: Record<string, string>
  examinedEdge: GraphEdge | null
}
interface GraphEventDataByType {
  TRAVERSAL_INITIALIZED: { kind: 'TRAVERSAL_INITIALIZED'; startNode: string }
  NODE_DEQUEUED: { kind: 'NODE_DEQUEUED'; node: string }
  NODE_COMPLETED: { kind: 'NODE_COMPLETED'; node: string }
  TRAVERSAL_COMPLETED: { kind: 'TRAVERSAL_COMPLETED'; traversalOrder: string[]; unreachableNodes: string[] }
}
export type GraphTraversalEvent = {
  [Type in keyof GraphEventDataByType]: {
    sequence: number
    type: Type
    pseudocodeLineId: string
    state: GraphTraversalState
    data: GraphEventDataByType[Type]
  }
}[keyof GraphEventDataByType]
export interface GraphTraversalTrace {
  apiVersion: '2.0'
  algorithm: { id: 'bfs'; name: 'Breadth-First Search'; family: 'GRAPH_TRAVERSAL' }
  input: { kind: 'GRAPH_TRAVERSAL'; nodes: string[]; edges: GraphEdge[]; startNode: string }
  result: {
    kind: 'GRAPH_TRAVERSAL'
    traversalOrder: string[]
    parents: Record<string, string>
    unreachableNodes: string[]
    visitedNodeCount: number
    edgeExaminationCount: number
    maximumQueueSize: number
  }
  limits: { maximumEvents: number }
  events: GraphTraversalEvent[]
}
export interface GraphAlgorithmCatalogEntry {
  id: 'bfs'
  name: 'Breadth-First Search'
  family: 'GRAPH_TRAVERSAL'
  contractVersion: '2.0'
  constraints: {
    kind: 'GRAPH_TRAVERSAL'
    minimumNodes: number
    maximumNodes: number
    maximumEdges: number
    nodeLabelPattern: string
    directed: false
    weighted: false
  }
}
export type AlgorithmCatalogEntry = SortingAlgorithmCatalogEntry | GraphAlgorithmCatalogEntry
export type VisualizerTrace = AlgorithmTrace | GraphTraversalTrace

export type MetricType = 'COMPARISONS' | 'READS' | 'WRITES' | 'SWAPS'
export interface ProblemDetail { type: string; title: string; status: number; detail: string; instance: string; code: string; field?: string }
