package com.nikola.algorithmvisualizer.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nikola.algorithmvisualizer.algorithm.AlgorithmRegistry;
import com.nikola.algorithmvisualizer.dynamicprogramming.KnapsackAlgorithm;
import com.nikola.algorithmvisualizer.datastructures.StackAlgorithm;
import com.nikola.algorithmvisualizer.datastructures.QueueAlgorithm;
import com.nikola.algorithmvisualizer.graph.BreadthFirstSearchAlgorithm;
import com.nikola.algorithmvisualizer.graph.DijkstraPathfindingAlgorithm;
import com.nikola.algorithmvisualizer.graph.IterativeDepthFirstSearchAlgorithm;
import com.nikola.algorithmvisualizer.search.LinearSearchAlgorithm;
import com.nikola.algorithmvisualizer.search.BinarySearchAlgorithm;
import com.nikola.algorithmvisualizer.trace.CompareData;
import com.nikola.algorithmvisualizer.trace.EventData;
import com.nikola.algorithmvisualizer.trace.HeapData;
import com.nikola.algorithmvisualizer.trace.MarkSortedData;
import com.nikola.algorithmvisualizer.trace.MergeData;
import com.nikola.algorithmvisualizer.trace.MinimumData;
import com.nikola.algorithmvisualizer.trace.PartitionData;
import com.nikola.algorithmvisualizer.trace.PassData;
import com.nikola.algorithmvisualizer.trace.RangeData;
import com.nikola.algorithmvisualizer.trace.ReadData;
import com.nikola.algorithmvisualizer.trace.SelectData;
import com.nikola.algorithmvisualizer.trace.SemanticEvent;
import com.nikola.algorithmvisualizer.trace.SwapData;
import com.nikola.algorithmvisualizer.trace.VersionedAlgorithmTrace;
import com.nikola.algorithmvisualizer.trace.WriteData;
import com.nikola.algorithmvisualizer.trace.TraceLimitExceededException;
import com.nikola.algorithmvisualizer.tree.BinarySearchTreeAlgorithm;

@RestController
@RequestMapping("/api/v2/algorithms")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class V2AlgorithmController {
    private static final String SORTING = "SORTING";
    private static final String GRAPH_TRAVERSAL = "GRAPH_TRAVERSAL";
    private static final String PATHFINDING = "PATHFINDING";
    private static final String SEARCH = "SEARCH";
    private static final String TREE = "TREE";
    private static final String DYNAMIC_PROGRAMMING = "DYNAMIC_PROGRAMMING";
    private static final String DATA_STRUCTURES = "DATA_STRUCTURES";
    private static final int MAXIMUM_EVENTS = 10_000;
    private final AlgorithmRegistry registry;
    private final BreadthFirstSearchAlgorithm breadthFirstSearch;
    private final IterativeDepthFirstSearchAlgorithm depthFirstSearch;
    private final DijkstraPathfindingAlgorithm dijkstraPathfinding;
    private final LinearSearchAlgorithm linearSearch;
    private final BinarySearchAlgorithm binarySearch;
    private final BinarySearchTreeAlgorithm binarySearchTree;
    private final KnapsackAlgorithm knapsack;
    private final StackAlgorithm stack;
    private final QueueAlgorithm queue;

    public V2AlgorithmController(AlgorithmRegistry registry, BreadthFirstSearchAlgorithm breadthFirstSearch,
            IterativeDepthFirstSearchAlgorithm depthFirstSearch,
            DijkstraPathfindingAlgorithm dijkstraPathfinding, LinearSearchAlgorithm linearSearch,
            BinarySearchAlgorithm binarySearch, BinarySearchTreeAlgorithm binarySearchTree, KnapsackAlgorithm knapsack,
            StackAlgorithm stack, QueueAlgorithm queue) {
        this.registry = registry;
        this.breadthFirstSearch = breadthFirstSearch;
        this.depthFirstSearch = depthFirstSearch;
        this.dijkstraPathfinding = dijkstraPathfinding;
        this.linearSearch = linearSearch;
        this.binarySearch = binarySearch;
        this.binarySearchTree = binarySearchTree;
        this.knapsack = knapsack;
        this.stack = stack;
        this.queue = queue;
    }

    @GetMapping
    List<V2Contracts.CatalogEntry> catalog() {
        var sorting = registry.catalog().stream()
                .map(entry -> new V2Contracts.CatalogEntry(entry.id(), entry.name(), SORTING, "2.0",
                        new V2Contracts.SortingConstraints(SORTING, 1, entry.inputConstraints().maxInputItems(),
                                Integer.MIN_VALUE, Integer.MAX_VALUE)))
                .toList();
        var catalog = new java.util.ArrayList<>(sorting);
        catalog.add(new V2Contracts.CatalogEntry("linear-search", "Linear Search", SEARCH, "2.0",
                new V2Contracts.SearchConstraints(SEARCH, 0, 50, Integer.MIN_VALUE, Integer.MAX_VALUE, false)));
        catalog.add(new V2Contracts.CatalogEntry("binary-search", "Binary Search", SEARCH, "2.0",
                new V2Contracts.SearchConstraints(SEARCH, 0, 50, Integer.MIN_VALUE, Integer.MAX_VALUE, true)));
        catalog.add(new V2Contracts.CatalogEntry("bfs", "Breadth-First Search", GRAPH_TRAVERSAL, "2.0",
                new V2Contracts.GraphTraversalConstraints(GRAPH_TRAVERSAL, 1, 12, 66,
                        "^[A-Za-z0-9_-]{1,16}$", false, true, 1, 99)));
        catalog.add(new V2Contracts.CatalogEntry("dfs", "Depth-First Search", GRAPH_TRAVERSAL, "2.0",
                new V2Contracts.GraphTraversalConstraints(GRAPH_TRAVERSAL, 1, 12, 66,
                        "^[A-Za-z0-9_-]{1,16}$", false, true, 1, 99)));
        catalog.add(new V2Contracts.CatalogEntry("dijkstra", "Dijkstra's Algorithm", PATHFINDING, "2.0",
                new V2Contracts.PathfindingConstraints(PATHFINDING, 1, 12, 66,
                        "^[A-Za-z0-9_-]{1,16}$", false, true, 1, 99, 1, true)));
        catalog.add(new V2Contracts.CatalogEntry("binary-search-tree", "Binary Search Tree", TREE, "2.0",
                new V2Contracts.TreeConstraints(TREE, 1, 31, Integer.MIN_VALUE, Integer.MAX_VALUE, true,
                        List.of("PREORDER", "INORDER", "POSTORDER", "LOOKUP"))));
        catalog.add(new V2Contracts.CatalogEntry("stack", "Stack", DATA_STRUCTURES, "2.0",
                new V2Contracts.DataStructureConstraints(DATA_STRUCTURES, 1, 50, 1, 40,
                        List.of("PUSH", "POP", "PEEK"))));
        catalog.add(new V2Contracts.CatalogEntry("queue", "Queue", DATA_STRUCTURES, "2.0",
                new V2Contracts.DataStructureConstraints(DATA_STRUCTURES, 1, 50, 1, 40,
                        List.of("ENQUEUE", "DEQUEUE", "PEEK"))));
        catalog.add(new V2Contracts.CatalogEntry("zero-one-knapsack", "0/1 Knapsack", DYNAMIC_PROGRAMMING, "2.0",
                new V2Contracts.DynamicProgrammingConstraints(DYNAMIC_PROGRAMMING, 1, 10, 0, 20, 1, 0)));
        return List.copyOf(catalog);
    }

    @PostMapping("/{algorithmId}/trace")
    @ResponseStatus(HttpStatus.OK)
    Object trace(@PathVariable String algorithmId, @RequestBody V2Request request) {
        if (request == null || request.kind() == null) {
            throw new IllegalArgumentException("Provide a request body with a kind");
        }
        if ("binary-search-tree".equals(algorithmId)) {
            if (!TREE.equals(request.kind())) throw new AlgorithmFamilyMismatchException(algorithmId, TREE);
            validateTree(request);
            var operation = BinarySearchTreeAlgorithm.Operation.valueOf(request.operation().kind());
            var treeTrace = binarySearchTree.execute(request.insertionValues(), operation, request.operation().target());
            if (treeTrace.events().size() > MAXIMUM_EVENTS) throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            return new V2Contracts.TreeTrace("2.0",
                    new V2Contracts.AlgorithmInfo("binary-search-tree", "Binary Search Tree", TREE),
                    new V2Contracts.TreeInput(TREE, request.insertionValues(), request.operation()),
                    treeTrace.result(), new V2Contracts.Limits(MAXIMUM_EVENTS), treeTrace.events());
        }
        if ("zero-one-knapsack".equals(algorithmId)) {
            if (!DYNAMIC_PROGRAMMING.equals(request.kind())) {
                throw new AlgorithmFamilyMismatchException(algorithmId, DYNAMIC_PROGRAMMING);
            }
            validateKnapsack(request);
            var items = request.items().stream()
                    .map(item -> new KnapsackAlgorithm.Item(item.name(), item.weight(), item.value())).toList();
            var knapsackTrace = knapsack.execute(items, request.capacity());
            if (knapsackTrace.events().size() > MAXIMUM_EVENTS) {
                throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            }
            return new V2Contracts.DynamicProgrammingTrace("2.0",
                    new V2Contracts.AlgorithmInfo("zero-one-knapsack", "0/1 Knapsack", DYNAMIC_PROGRAMMING),
                    new V2Contracts.DynamicProgrammingInput(DYNAMIC_PROGRAMMING, request.items(), request.capacity()),
                    knapsackTrace.result(), new V2Contracts.Limits(MAXIMUM_EVENTS), knapsackTrace.events());
        }
        if ("stack".equals(algorithmId)) {
            if (!DATA_STRUCTURES.equals(request.kind())) {
                throw new AlgorithmFamilyMismatchException(algorithmId, DATA_STRUCTURES);
            }
            validateStructure(request, "stack", List.of("PUSH", "POP", "PEEK"), "PUSH");
            var operations = request.operations().stream()
                    .map(operation -> new StackAlgorithm.Operation(operation.kind(), operation.value())).toList();
            var stackTrace = stack.execute(operations);
            if (stackTrace.events().size() > MAXIMUM_EVENTS) {
                throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            }
            return new V2Contracts.DataStructureTrace("2.0",
                    new V2Contracts.AlgorithmInfo("stack", "Stack", DATA_STRUCTURES),
                    new V2Contracts.DataStructureInput(DATA_STRUCTURES, request.operations()), stackTrace.result(),
                    new V2Contracts.Limits(MAXIMUM_EVENTS), stackTrace.events());
        }
        if ("queue".equals(algorithmId)) {
            if (!DATA_STRUCTURES.equals(request.kind())) {
                throw new AlgorithmFamilyMismatchException(algorithmId, DATA_STRUCTURES);
            }
            validateStructure(request, "queue", List.of("ENQUEUE", "DEQUEUE", "PEEK"), "ENQUEUE");
            var operations = request.operations().stream()
                    .map(operation -> new QueueAlgorithm.Operation(operation.kind(), operation.value())).toList();
            var queueTrace = queue.execute(operations);
            if (queueTrace.events().size() > MAXIMUM_EVENTS) {
                throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            }
            return new V2Contracts.DataStructureTrace("2.0",
                    new V2Contracts.AlgorithmInfo("queue", "Queue", DATA_STRUCTURES),
                    new V2Contracts.DataStructureInput(DATA_STRUCTURES, request.operations()), queueTrace.result(),
                    new V2Contracts.Limits(MAXIMUM_EVENTS), queueTrace.events());
        }
        if ("bfs".equals(algorithmId)) {
            if (!GRAPH_TRAVERSAL.equals(request.kind())) {
                throw new AlgorithmFamilyMismatchException(algorithmId, GRAPH_TRAVERSAL);
            }
            validateGraph(request);
            var edges = request.edges().stream()
                    .map(edge -> new BreadthFirstSearchAlgorithm.Edge(edge.from(), edge.to()))
                    .toList();
            if (request.destination() != null && !request.nodes().contains(request.destination())) {
                throw new GraphValidationException("destination", "Select a declared destination node");
            }
            var graphTrace = breadthFirstSearch.execute(request.nodes(), edges, request.startNode(),
                    request.destination());
            if (graphTrace.events().size() > MAXIMUM_EVENTS) {
                throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            }
            return new V2Contracts.GraphTraversalTrace("2.0",
                    new V2Contracts.AlgorithmInfo("bfs", "Breadth-First Search", GRAPH_TRAVERSAL),
                    new V2Contracts.GraphTraversalInput(GRAPH_TRAVERSAL, request.nodes(), request.edges(),
                            request.startNode(), request.destination()),
                    graphTrace.result(), new V2Contracts.Limits(MAXIMUM_EVENTS), graphTrace.events());
        }
        if ("linear-search".equals(algorithmId)) {
            if (!SEARCH.equals(request.kind())) throw new AlgorithmFamilyMismatchException(algorithmId, SEARCH);
            validateSearch(request);
            var searchTrace = linearSearch.execute(request.values(), request.target());
            return new V2Contracts.SearchTrace("2.0", new V2Contracts.AlgorithmInfo("linear-search", "Linear Search", SEARCH),
                    new V2Contracts.SearchInput(SEARCH, request.values(), request.target()), searchTrace.result(),
                    new V2Contracts.Limits(MAXIMUM_EVENTS), searchTrace.events());
        }
        if ("binary-search".equals(algorithmId)) {
            if (!SEARCH.equals(request.kind())) throw new AlgorithmFamilyMismatchException(algorithmId, SEARCH);
            validateSearch(request);
            for (int index = 1; index < request.values().size(); index++) {
                if (request.values().get(index - 1) > request.values().get(index)) {
                    throw new GraphValidationException("values[" + index + "]",
                            "Binary search requires values in non-decreasing order; indices "
                                    + (index - 1) + " and " + index + " are inverted");
                }
            }
            var searchTrace = binarySearch.execute(request.values(), request.target());
            return new V2Contracts.SearchTrace("2.0", new V2Contracts.AlgorithmInfo("binary-search", "Binary Search", SEARCH),
                    new V2Contracts.SearchInput(SEARCH, request.values(), request.target()), searchTrace.result(),
                    new V2Contracts.Limits(MAXIMUM_EVENTS), searchTrace.events());
        }
        if ("dfs".equals(algorithmId)) {
            if (!GRAPH_TRAVERSAL.equals(request.kind())) {
                throw new AlgorithmFamilyMismatchException(algorithmId, GRAPH_TRAVERSAL);
            }
            validateGraph(request);
            if (request.destination() != null) {
                throw new GraphValidationException("destination", "Depth-first search does not accept a destination");
            }
            var edges = request.edges().stream()
                    .map(edge -> new IterativeDepthFirstSearchAlgorithm.Edge(edge.from(), edge.to()))
                    .toList();
            var graphTrace = depthFirstSearch.execute(request.nodes(), edges, request.startNode());
            if (graphTrace.events().size() > MAXIMUM_EVENTS) {
                throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            }
            return new V2Contracts.DepthFirstSearchTrace("2.0",
                    new V2Contracts.AlgorithmInfo("dfs", "Depth-First Search", GRAPH_TRAVERSAL),
                    new V2Contracts.GraphTraversalInput(GRAPH_TRAVERSAL, request.nodes(), request.edges(),
                            request.startNode(), null),
                    graphTrace.result(), new V2Contracts.Limits(MAXIMUM_EVENTS), graphTrace.events());
        }
        if ("dijkstra".equals(algorithmId)) {
            if (!PATHFINDING.equals(request.kind())) {
                throw new AlgorithmFamilyMismatchException(algorithmId, PATHFINDING);
            }
            validateGraph(request);
            if (request.destination() == null || !request.nodes().contains(request.destination())) {
                throw new GraphValidationException("destination", "Select a declared destination node");
            }
            var edges = request.edges().stream()
                    .map(edge -> new DijkstraPathfindingAlgorithm.Edge(edge.from(), edge.to(),
                            edge.weight() == null ? 1 : edge.weight()))
                    .toList();
            var pathTrace = dijkstraPathfinding.execute(request.nodes(), edges, request.startNode(),
                    request.destination());
            if (pathTrace.events().size() > MAXIMUM_EVENTS) {
                throw new TraceLimitExceededException(MAXIMUM_EVENTS);
            }
            return new V2Contracts.PathfindingTrace("2.0",
                    new V2Contracts.AlgorithmInfo("dijkstra", "Dijkstra's Algorithm", PATHFINDING),
                    new V2Contracts.PathfindingInput(PATHFINDING, request.nodes(), request.edges(),
                            request.startNode(), request.destination()),
                    pathTrace.result(), new V2Contracts.Limits(MAXIMUM_EVENTS), pathTrace.events());
        }
        var algorithm = registry.require(algorithmId);
        if (!SORTING.equals(request.kind())) {
            throw new AlgorithmFamilyMismatchException(algorithmId, SORTING);
        }

        if (request.values() == null || request.values().isEmpty() || request.values().size() > 50
                || request.values().stream().anyMatch(java.util.Objects::isNull)) {
            throw new IllegalArgumentException("Provide between 1 and 50 integer values");
        }
        VersionedAlgorithmTrace<?> trace = algorithm.execute(request.values());
        return new V2Contracts.SortingTrace("2.0",
                new V2Contracts.AlgorithmInfo(algorithm.id(), algorithm.info().name(), SORTING),
                new V2Contracts.SortingInput(SORTING, trace.inputValues()),
                new V2Contracts.SortingResult(SORTING, trace.summary().resultValues()),
                new V2Contracts.Limits(MAXIMUM_EVENTS),
                trace.events().stream().map(V2AlgorithmController::toV2Event).toList());
    }

    private static void validateGraph(V2Request request) {
        if (request.nodes() == null || request.nodes().isEmpty() || request.nodes().size() > 12) {
            throw new GraphValidationException("nodes", "Provide between 1 and 12 nodes");
        }
        if (request.nodes().stream().anyMatch(node -> node == null || !node.matches("^[A-Za-z0-9_-]{1,16}$"))
                || request.nodes().stream().distinct().count() != request.nodes().size()) {
            throw new GraphValidationException("nodes", "Node labels must be unique and contain 1–16 letters, numbers, underscores, or hyphens");
        }
        if (request.startNode() == null || !request.nodes().contains(request.startNode())) {
            throw new GraphValidationException("startNode", "Select a declared start node");
        }
        if (request.edges() == null || request.edges().size() > 66) {
            throw new GraphValidationException("edges", "Provide an edge list with at most 66 edges");
        }
        var seen = new java.util.HashMap<java.util.Set<String>, Integer>();
        for (int index = 0; index < request.edges().size(); index++) {
            var edge = request.edges().get(index);
            String field = "edges[" + index + "]";
            if (edge == null || edge.from() == null || edge.to() == null
                    || !request.nodes().contains(edge.from()) || !request.nodes().contains(edge.to())) {
                throw new GraphValidationException(field, "Edge " + (index + 1) + " must connect two declared nodes");
            }
            if (edge.from().equals(edge.to())) {
                throw new GraphValidationException(field, "Edge " + (index + 1) + ": self-loops are not allowed");
            }
            if (edge.weight() != null && (edge.weight() < 1 || edge.weight() > 99)) {
                throw new GraphValidationException(field + ".weight", "Edge " + (index + 1) + ": weight must be an integer from 1 through 99");
            }
            Integer original = seen.putIfAbsent(java.util.Set.of(edge.from(), edge.to()), index);
            if (original != null) {
                throw new GraphValidationException(field, "Edge " + (index + 1)
                        + ": duplicate edge; first declared as edge " + (original + 1));
            }
        }
    }
    private static void validateSearch(V2Request request) {
        if (request.values() == null || request.values().size() > 50 || request.values().stream().anyMatch(java.util.Objects::isNull))
            throw new IllegalArgumentException("Provide between 0 and 50 signed 32-bit integer values");
        if (request.target() == null) throw new IllegalArgumentException("Provide a signed 32-bit integer target");
    }

    private static void validateTree(V2Request request) {
        if (request.insertionValues() == null || request.insertionValues().isEmpty()
                || request.insertionValues().size() > 31 || request.insertionValues().stream().anyMatch(java.util.Objects::isNull)) {
            throw new GraphValidationException("insertionValues", "Provide between 1 and 31 unique signed 32-bit integer values");
        }
        for (int index = 0; index < request.insertionValues().size(); index++) {
            if (request.insertionValues().subList(0, index).contains(request.insertionValues().get(index))) {
                throw new GraphValidationException("insertionValues[" + index + "]", "Insertion values must be unique");
            }
        }
        if (request.operation() == null || (!"PREORDER".equals(request.operation().kind())
                && !"INORDER".equals(request.operation().kind()) && !"POSTORDER".equals(request.operation().kind())
                && !"LOOKUP".equals(request.operation().kind()))) {
            throw new GraphValidationException("operation", "Select the PREORDER, INORDER, POSTORDER, or LOOKUP tree operation");
        }
        if ("LOOKUP".equals(request.operation().kind()) && request.operation().target() == null) {
            throw new GraphValidationException("operation.target", "Provide a signed 32-bit integer lookup target");
        }
        if (("PREORDER".equals(request.operation().kind()) || "INORDER".equals(request.operation().kind())
                || "POSTORDER".equals(request.operation().kind()))
                && request.operation().target() != null) {
            throw new GraphValidationException("operation.target", "Tree traversals do not accept a lookup target");
        }
    }

    private static void validateKnapsack(V2Request request) {
        if (request.items() == null || request.items().size() < 1 || request.items().size() > 10) {
            throw new GraphValidationException("items", "Provide from 1 through 10 named items");
        }
        for (int index = 0; index < request.items().size(); index++) {
            var item = request.items().get(index);
            if (item == null || item.name() == null || item.name().isBlank()) {
                throw new GraphValidationException("items[" + index + "].name", "Provide a non-empty item name");
            }
            if (item.weight() < 1) {
                throw new GraphValidationException("items[" + index + "].weight", "Item weight must be at least 1");
            }
            if (item.value() < 0) {
                throw new GraphValidationException("items[" + index + "].value", "Item value must be non-negative");
            }
        }
        if (request.capacity() == null || request.capacity() < 0 || request.capacity() > 20) {
            throw new GraphValidationException("capacity", "Use a whole-number capacity from 0 through 20");
        }
    }

    private static void validateStructure(V2Request request, String structureName, List<String> allowedOperations,
            String valueOperation) {
        if (request.operations() == null || request.operations().isEmpty() || request.operations().size() > 50) {
            throw new GraphValidationException("operations", "Provide from 1 through 50 " + structureName + " operations");
        }
        for (int index = 0; index < request.operations().size(); index++) {
            var operation = request.operations().get(index);
            String field = "operations[" + index + "]";
            if (operation == null || !allowedOperations.contains(operation.kind())) {
                throw new GraphValidationException(field + ".kind", "Use " + String.join(", ", allowedOperations));
            }
            if (valueOperation.equals(operation.kind()) && (operation.value() == null || operation.value().isBlank()
                    || operation.value().length() > 40)) {
                throw new GraphValidationException(field + ".value", structureName + " values must contain 1 through 40 characters");
            }
            if (!valueOperation.equals(operation.kind()) && operation.value() != null) {
                throw new GraphValidationException(field + ".value", "Only " + valueOperation + " accepts a structure value");
            }
        }
    }

    private static V2Contracts.SortingEvent toV2Event(SemanticEvent<?> event) {
        return new V2Contracts.SortingEvent(event.sequence(), event.type().name(),
                event.pseudocodeLineId(),
                new V2Contracts.SortingState(SORTING, event.state(), event.sortedRanges()),
                toV2Data(event));
    }

    private static V2Contracts.SortingEventData toV2Data(SemanticEvent<?> event) {
        EventData data = event.data();
        String kind = event.type().name();
        if (data instanceof SelectData value) {
            return new V2Contracts.SelectEventData(kind, value.index(), value.item());
        }
        if (data instanceof ReadData value) {
            return new V2Contracts.ReadEventData(kind, value.indices(), value.items());
        }
        if (data instanceof CompareData value) {
            return new V2Contracts.CompareEventData(kind, value.indices(), value.items(), value.result());
        }
        if (data instanceof SwapData value) {
            return new V2Contracts.SwapEventData(kind, value.indices());
        }
        if (data instanceof WriteData value) {
            return new V2Contracts.WriteEventData(kind, value.indices(), value.items());
        }
        if (data instanceof MarkSortedData value) {
            return new V2Contracts.RangeEventData(kind, value.fromIndex(), value.throughIndex());
        }
        if (data instanceof RangeData value) {
            return new V2Contracts.RangeEventData(kind, value.fromIndex(), value.throughIndex());
        }
        if (data instanceof PassData value) {
            return new V2Contracts.PassEventData(kind, value.pass(), value.swapped());
        }
        if (data instanceof MinimumData value) {
            return new V2Contracts.MinimumEventData(kind, value.index(), value.item());
        }
        if (data instanceof MergeData value) {
            return new V2Contracts.MergeEventData(kind, value.left(), value.middle(), value.right(), value.buffer());
        }
        if (data instanceof PartitionData value) {
            return new V2Contracts.PartitionEventData(kind, value.left(), value.right(), value.scanner(),
                    value.boundary(), value.pivotIndex());
        }
        if (data instanceof HeapData value) {
            return new V2Contracts.HeapEventData(kind, value.heapSize(), value.rootIndex(), value.childIndex());
        }
        throw new IllegalArgumentException("Unsupported sorting event data: " + data.getClass().getName());
    }

    public record V2Request(String kind, List<Integer> values, Integer target, List<String> nodes,
            List<V2Contracts.GraphEdge> edges, String startNode, String destination,
            List<Integer> insertionValues, V2Contracts.TreeOperation operation,
            List<V2Contracts.KnapsackItem> items, Integer capacity,
            List<V2Contracts.StructureOperation> operations) { }
}
