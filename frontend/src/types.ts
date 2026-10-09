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
export interface GraphEdge { from: string; to: string; weight?: number }
export interface GraphTraversalState {
  kind: 'GRAPH_TRAVERSAL'
  nodeStatuses: Record<string, NodeStatus>
  queue: string[]
  traversalOrder: string[]
  parents: Record<string, string>
  examinedEdge: GraphEdge | null
  selectedPath?: string[]
}
interface GraphEventDataByType {
  TRAVERSAL_INITIALIZED: { kind: 'TRAVERSAL_INITIALIZED'; startNode: string }
  NODE_DEQUEUED: { kind: 'NODE_DEQUEUED'; node: string }
  EDGE_EXAMINED: { kind: 'EDGE_EXAMINED'; from: string; to: string }
  NODE_DISCOVERED: { kind: 'NODE_DISCOVERED'; node: string; parent: string }
  ALREADY_DISCOVERED_SKIPPED: { kind: 'ALREADY_DISCOVERED_SKIPPED'; from: string; to: string }
  NODE_COMPLETED: { kind: 'NODE_COMPLETED'; node: string }
  TRAVERSAL_COMPLETED: { kind: 'TRAVERSAL_COMPLETED'; traversalOrder: string[]; unreachableNodes: string[] }
  PATH_RECONSTRUCTED: { kind: 'PATH_RECONSTRUCTED'; destination: string; pathFound: boolean; path: string[]; pathEdgeCount?: number }
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
  input: { kind: 'GRAPH_TRAVERSAL'; nodes: string[]; edges: GraphEdge[]; startNode: string; destination?: string }
  result: {
    kind: 'GRAPH_TRAVERSAL'
    traversalOrder: string[]
    parents: Record<string, string>
    unreachableNodes: string[]
    visitedNodeCount: number
    edgeExaminationCount: number
    maximumQueueSize: number
    pathFound?: boolean
    path?: string[]
    pathEdgeCount?: number
    unexploredNodes?: string[]
  }
  limits: { maximumEvents: number }
  events: GraphTraversalEvent[]
}
export interface DepthFirstSearchState {
  kind: 'GRAPH_TRAVERSAL'
  nodeStatuses: Record<string, NodeStatus>
  stack: string[]
  traversalOrder: string[]
  parents: Record<string, string>
  examinedEdge: GraphEdge | null
}
interface DepthFirstSearchEventDataByType {
  TRAVERSAL_INITIALIZED: { kind: 'TRAVERSAL_INITIALIZED'; startNode: string }
  NODE_POPPED: { kind: 'NODE_POPPED'; node: string }
  EDGE_EXAMINED: { kind: 'EDGE_EXAMINED'; from: string; to: string }
  NODE_DISCOVERED: { kind: 'NODE_DISCOVERED'; node: string; parent: string }
  ALREADY_DISCOVERED_SKIPPED: { kind: 'ALREADY_DISCOVERED_SKIPPED'; from: string; to: string }
  NODE_COMPLETED: { kind: 'NODE_COMPLETED'; node: string }
  TRAVERSAL_COMPLETED: { kind: 'TRAVERSAL_COMPLETED'; traversalOrder: string[]; unreachableNodes: string[] }
}
export type DepthFirstSearchEvent = {
  [Type in keyof DepthFirstSearchEventDataByType]: {
    sequence: number
    type: Type
    pseudocodeLineId: string
    state: DepthFirstSearchState
    data: DepthFirstSearchEventDataByType[Type]
  }
}[keyof DepthFirstSearchEventDataByType]
export interface DepthFirstSearchTrace {
  apiVersion: '2.0'
  algorithm: { id: 'dfs'; name: 'Depth-First Search'; family: 'GRAPH_TRAVERSAL' }
  input: { kind: 'GRAPH_TRAVERSAL'; nodes: string[]; edges: GraphEdge[]; startNode: string }
  result: {
    kind: 'GRAPH_TRAVERSAL'
    traversalOrder: string[]
    parents: Record<string, string>
    unreachableNodes: string[]
    visitedNodeCount: number
    edgeExaminationCount: number
    maximumStackSize: number
  }
  limits: { maximumEvents: number }
  events: DepthFirstSearchEvent[]
}
export type PathfindingNodeStatus = 'UNREACHED' | 'FRONTIER' | 'ACTIVE' | 'SETTLED'
export interface PathfindingState {
  kind: 'PATHFINDING'
  nodeStatuses: Record<string, PathfindingNodeStatus>
  tentativeDistances: Record<string, number | null>
  parents: Record<string, string>
  frontier: { node: string; distance: number }[]
  examinedEdge: GraphEdge | null
  selectedPath?: string[]
}
interface PathfindingEventDataByType {
  PATHFINDING_INITIALIZED: { kind: 'PATHFINDING_INITIALIZED'; startNode: string; destination: string }
  NODE_SELECTED: { kind: 'NODE_SELECTED'; node: string; distance: number }
  NODE_SETTLED: { kind: 'NODE_SETTLED'; node: string; distance: number }
  EDGE_EXAMINED: { kind: 'EDGE_EXAMINED'; from: string; to: string; weight: number; candidateCost: number; currentKnownCost?: number }
  DISTANCE_UPDATED: { kind: 'DISTANCE_UPDATED'; node: string; parent: string; previousDistance?: number; newDistance: number }
  RELAXATION_REJECTED: { kind: 'RELAXATION_REJECTED'; from: string; to: string; weight: number; candidateCost: number; currentKnownCost?: number }
  STALE_FRONTIER_ENTRY_SKIPPED: { kind: 'STALE_FRONTIER_ENTRY_SKIPPED'; node: string; queuedDistance: number; currentDistance?: number }
  PATH_RECONSTRUCTED: { kind: 'PATH_RECONSTRUCTED'; destination: string; pathFound: boolean; path: string[]; totalCost?: number }
}
export type PathfindingEvent = {
  [Type in keyof PathfindingEventDataByType]: {
    sequence: number
    type: Type
    pseudocodeLineId: string
    state: PathfindingState
    data: PathfindingEventDataByType[Type]
  }
}[keyof PathfindingEventDataByType]
export interface PathfindingTrace {
  apiVersion: '2.0'
  algorithm: { id: 'dijkstra'; name: "Dijkstra's Algorithm"; family: 'PATHFINDING' }
  input: { kind: 'PATHFINDING'; nodes: string[]; edges: GraphEdge[]; startNode: string; destination: string }
  result: {
    kind: 'PATHFINDING'
    pathFound: boolean
    path: string[]
    totalCost?: number
    settledOrder: string[]
    parents: Record<string, string>
    settledNodeCount: number
    relaxationAttemptCount: number
    successfulUpdateCount: number
    rejectedUpdateCount: number
    maximumFrontierSize: number
  }
  limits: { maximumEvents: number }
  events: PathfindingEvent[]
}
export type GraphAlgorithmTrace = GraphTraversalTrace | DepthFirstSearchTrace | PathfindingTrace
export type GraphAlgorithmState = GraphTraversalState | DepthFirstSearchState | PathfindingState
export type GraphAlgorithmEvent = GraphTraversalEvent | DepthFirstSearchEvent | PathfindingEvent
export type GraphAlgorithmResult = GraphAlgorithmTrace['result']
export interface GraphAlgorithmCatalogEntry {
  id: string
  name: string
  family: 'GRAPH_TRAVERSAL'
  contractVersion: '2.0'
  constraints: {
    kind: 'GRAPH_TRAVERSAL'
    minimumNodes: number
    maximumNodes: number
    maximumEdges: number
    nodeLabelPattern: string
    directed: false
    weighted: boolean
    minimumWeight?: number
    maximumWeight?: number
  }
}
export interface PathfindingCatalogEntry {
  id: string
  name: string
  family: 'PATHFINDING'
  contractVersion: '2.0'
  constraints: {
    kind: 'PATHFINDING'
    minimumNodes: number
    maximumNodes: number
    maximumEdges: number
    nodeLabelPattern: string
    directed: false
    weighted: true
    minimumWeight: number
    maximumWeight: number
    unweightedEdgeCost: 1
    destinationRequired: true
  }
}
export interface SearchCatalogEntry { id: 'linear-search' | 'binary-search'; name: string; family: 'SEARCH'; contractVersion: '2.0'; constraints: { kind: 'SEARCH'; minimumValues: 0; maximumValues: 50; minimumValue: number; maximumValue: number; requiresNonDecreasingValues: boolean } }
export interface SearchState { kind: 'SEARCH'; values: number[]; target: number; lowerBound?: number; upperBound?: number; selectedIndex?: number; inspectedIndices: number[] }
export type SearchEventType = 'SEARCH_INITIALIZED' | 'CANDIDATE_SELECTED' | 'TARGET_COMPARED' | 'SEARCH_INTERVAL_NARROWED' | 'SEARCH_FOUND' | 'SEARCH_NOT_FOUND'
export interface SearchEvent { sequence: number; type: SearchEventType; pseudocodeLineId: string; state: SearchState; data: { kind: SearchEventType; index?: number; value?: number; relation?: 'LESS' | 'EQUAL' | 'GREATER'; lowerBound?: number; upperBound?: number; found?: boolean } }
export interface SearchTrace { apiVersion: '2.0'; algorithm: { id: 'linear-search' | 'binary-search'; name: string; family: 'SEARCH' }; input: { kind: 'SEARCH'; values: number[]; target: number }; result: { kind: 'SEARCH'; found: boolean; foundIndex?: number; comparisons: number }; limits: { maximumEvents: number }; events: SearchEvent[] }
export interface TreeNode { id: number; value: number; parentId: number | null; leftId: number | null; rightId: number | null }
export interface TreeState { kind: 'TREE'; nodes: TreeNode[]; rootId: number | null; activeNodeId: number | null; traversalOrder: number[]; comparisonDirection: 'left' | 'right' | null; attachedNodeId: number | null; lookupTarget?: number | null; lookupPath?: number[] }
export interface TreeEvent { sequence: number; type: 'TREE_INITIALIZED' | 'INSERTION_NODE_VISITED' | 'INSERTION_COMPARED' | 'NODE_ATTACHED' | 'CONSTRUCTION_COMPLETED' | 'LOOKUP_NODE_VISITED' | 'LOOKUP_COMPARED' | 'LOOKUP_FOUND' | 'LOOKUP_NOT_FOUND' | 'TRAVERSAL_NODE_VISITED' | 'OPERATION_COMPLETED'; pseudocodeLineId: string; state: TreeState; data: { kind: string; nodeId: number | null; parentId: number | null; position: 'root' | 'left' | 'right' | null; direction: 'left' | 'right' | null; attachedNodeId: number | null } }
export type TreeOperation = { kind: 'PREORDER' | 'INORDER' | 'POSTORDER' } | { kind: 'LOOKUP'; target: number }
export type TreeResult = { kind: 'PREORDER' | 'INORDER' | 'POSTORDER'; found: null; target: null; matchedNodeId: null; visitedValues: number[]; visitedNodeCount: number; comparisonCount: null; constructionComparisonCount: number; constructionAttachmentCount: number } | { kind: 'LOOKUP'; found: boolean; target: number; matchedNodeId: number | null; visitedValues: number[]; visitedNodeCount: number; comparisonCount: number; constructionComparisonCount: number; constructionAttachmentCount: number }
export interface TreeTrace { apiVersion: '2.0'; algorithm: { id: 'binary-search-tree'; name: 'Binary Search Tree'; family: 'TREE' }; input: { kind: 'TREE'; insertionValues: number[]; operation: TreeOperation }; result: TreeResult; limits: { maximumEvents: number }; events: TreeEvent[] }
export interface TreeCatalogEntry { id: 'binary-search-tree'; name: 'Binary Search Tree'; family: 'TREE'; contractVersion: '2.0'; constraints: { kind: 'TREE'; minimumValues: 1; maximumValues: 31; minimumValue: number; maximumValue: number; uniqueValues: true; operations: Array<'PREORDER' | 'INORDER' | 'POSTORDER' | 'LOOKUP'> } }
export interface KnapsackItem { name: string; weight: number; value: number }
export interface DynamicProgrammingState { kind: 'DYNAMIC_PROGRAMMING'; items: KnapsackItem[]; capacity: number; table: number[][]; activeItemCount: number; activeCapacity: number; dependencyCells: Array<{ itemCount: number; capacity: number }>; selectedItems: KnapsackItem[]; selectedItemIndices: number[]; phase: 'BASE_CASES' | 'TABULATION' | 'RECONSTRUCTION' }
export interface DynamicProgrammingEvent { sequence: number; type: 'BASE_CASES_INITIALIZED' | 'CELL_EVALUATED' | 'CELL_COMMITTED' | 'RECONSTRUCTION_STARTED' | 'ITEM_SELECTED' | 'ITEM_EXCLUDED' | 'RECONSTRUCTION_COMPLETED'; pseudocodeLineId: string; state: DynamicProgrammingState; data: { kind: 'BASE_CASES_INITIALIZED' | 'CELL_EVALUATED' | 'CELL_COMMITTED' | 'RECONSTRUCTION_STARTED' | 'ITEM_SELECTED' | 'ITEM_EXCLUDED' | 'RECONSTRUCTION_COMPLETED'; excludeValue?: number; includeValue?: number; committedValue?: number; selectedBranch?: 'INCLUDE' | 'EXCLUDE'; unavailableCandidateReason?: string; itemName?: string } }
export interface DynamicProgrammingTrace { apiVersion: '2.0'; algorithm: { id: 'zero-one-knapsack'; name: '0/1 Knapsack'; family: 'DYNAMIC_PROGRAMMING' }; input: { kind: 'DYNAMIC_PROGRAMMING'; items: KnapsackItem[]; capacity: number }; result: { kind: 'DYNAMIC_PROGRAMMING'; maximumValue: number; totalSelectedWeight: number; selectedItems: KnapsackItem[] }; limits: { maximumEvents: number }; events: DynamicProgrammingEvent[] }
export interface DynamicProgrammingCatalogEntry { id: 'zero-one-knapsack'; name: '0/1 Knapsack'; family: 'DYNAMIC_PROGRAMMING'; contractVersion: '2.0'; constraints: { kind: 'DYNAMIC_PROGRAMMING'; minimumItems: 1; maximumItems: 10; minimumCapacity: 0; maximumCapacity: 20; minimumWeight: 1; minimumValue: 0 } }
export interface StructureOperation { kind: 'PUSH' | 'POP' | 'ENQUEUE' | 'DEQUEUE' | 'PEEK' | 'PREPEND' | 'APPEND' | 'REMOVE_FIRST' | 'FIND'; value?: string }
export interface DataStructureState { kind: 'DATA_STRUCTURES'; values: string[]; occurrenceIds: number[]; activeOperationIndex: number }
export interface DataStructureEvent { sequence: number; type: 'PUSH' | 'POP' | 'ENQUEUE' | 'DEQUEUE' | 'PEEK' | 'EMPTY_STRUCTURE'; pseudocodeLineId: string; state: DataStructureState; data: { kind: string; operation: StructureOperation['kind']; value?: string; occurrenceId?: number; outcome: string } }
export interface DataStructureTrace { apiVersion: '2.0'; algorithm: { id: 'stack' | 'queue'; name: 'Stack' | 'Queue'; family: 'DATA_STRUCTURES' }; input: { kind: 'DATA_STRUCTURES'; operations: StructureOperation[] }; result: { kind: 'DATA_STRUCTURES'; values: string[]; occurrenceIds: number[]; outcomes: string[] }; limits: { maximumEvents: number }; events: DataStructureEvent[] }
export interface DataStructureCatalogEntry { id: 'stack' | 'queue'; name: 'Stack' | 'Queue'; family: 'DATA_STRUCTURES'; contractVersion: '2.0'; constraints: { kind: 'DATA_STRUCTURES'; minimumOperations: 1; maximumOperations: 50; minimumValueLength: 1; maximumValueLength: 40; operations: Array<StructureOperation['kind']> } }
export interface LinkedListNode { occurrenceId: number; value: string; nextOccurrenceId: number | null }
export interface LinkedListState { kind: 'LINKED_LIST'; nodes: LinkedListNode[]; headOccurrenceId: number | null; activeOperationIndex: number; allocatedOccurrenceId: number | null; inspectedOccurrenceId: number | null; linkedOccurrenceId: number | null; matchedOccurrenceId?: number | null; detachedOccurrenceId?: number | null }
export interface LinkedListEvent { sequence: number; type: 'NODE_ALLOCATED' | 'NEXT_INITIALIZED' | 'HEAD_MOVED' | 'NODE_INSPECTED' | 'FINAL_LINK_CREATED' | 'NODE_MATCHED' | 'SEARCH_NOT_FOUND' | 'HEAD_SELECTED' | 'NODE_DETACHED' | 'NODE_REMOVED' | 'EMPTY_STRUCTURE'; pseudocodeLineId: string; state: LinkedListState; data: { kind: 'NODE_ALLOCATED' | 'NEXT_INITIALIZED' | 'HEAD_MOVED' | 'NODE_INSPECTED' | 'FINAL_LINK_CREATED' | 'NODE_MATCHED' | 'SEARCH_NOT_FOUND' | 'HEAD_SELECTED' | 'NODE_DETACHED' | 'NODE_REMOVED' | 'EMPTY_STRUCTURE'; value: string; occurrenceId: number | null; nextOccurrenceId: number | null } }
export interface LinkedListTrace { apiVersion: '2.0'; algorithm: { id: 'linked-list'; name: 'Linked List'; family: 'DATA_STRUCTURES' }; input: { kind: 'LINKED_LIST'; operations: Array<{ kind: 'PREPEND' | 'APPEND' | 'FIND'; value: string } | { kind: 'REMOVE_FIRST' }> }; result: { kind: 'LINKED_LIST'; nodes: LinkedListNode[]; headOccurrenceId: number | null; outcomes: string[] }; limits: { maximumEvents: number }; events: LinkedListEvent[] }
export interface LinkedListCatalogEntry { id: 'linked-list'; name: 'Linked List'; family: 'DATA_STRUCTURES'; contractVersion: '2.0'; constraints: { kind: 'DATA_STRUCTURES'; minimumOperations: 1; maximumOperations: 50; minimumValueLength: 1; maximumValueLength: 40; operations: ['PREPEND', 'APPEND', 'REMOVE_FIRST', 'FIND'] } }
export type StructureTrace = DataStructureTrace | LinkedListTrace
export type AlgorithmCatalogEntry = SortingAlgorithmCatalogEntry | GraphAlgorithmCatalogEntry | PathfindingCatalogEntry | SearchCatalogEntry | TreeCatalogEntry | DynamicProgrammingCatalogEntry | DataStructureCatalogEntry | LinkedListCatalogEntry
export type VisualizerTrace = AlgorithmTrace | GraphAlgorithmTrace | SearchTrace | TreeTrace | DynamicProgrammingTrace | StructureTrace

export type MetricType = 'COMPARISONS' | 'READS' | 'WRITES' | 'SWAPS'
export interface ProblemDetail { type: string; title: string; status: number; detail: string; instance: string; code: string; field?: string }
