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
import com.nikola.algorithmvisualizer.graph.BreadthFirstSearchAlgorithm;
import com.nikola.algorithmvisualizer.graph.DijkstraPathfindingAlgorithm;
import com.nikola.algorithmvisualizer.graph.IterativeDepthFirstSearchAlgorithm;
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

@RestController
@RequestMapping("/api/v2/algorithms")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class V2AlgorithmController {
    private static final String SORTING = "SORTING";
    private static final String GRAPH_TRAVERSAL = "GRAPH_TRAVERSAL";
    private static final String PATHFINDING = "PATHFINDING";
    private static final int MAXIMUM_EVENTS = 10_000;
    private final AlgorithmRegistry registry;
    private final BreadthFirstSearchAlgorithm breadthFirstSearch;
    private final IterativeDepthFirstSearchAlgorithm depthFirstSearch;
    private final DijkstraPathfindingAlgorithm dijkstraPathfinding;

    public V2AlgorithmController(AlgorithmRegistry registry, BreadthFirstSearchAlgorithm breadthFirstSearch,
            IterativeDepthFirstSearchAlgorithm depthFirstSearch,
            DijkstraPathfindingAlgorithm dijkstraPathfinding) {
        this.registry = registry;
        this.breadthFirstSearch = breadthFirstSearch;
        this.depthFirstSearch = depthFirstSearch;
        this.dijkstraPathfinding = dijkstraPathfinding;
    }

    @GetMapping
    List<V2Contracts.CatalogEntry> catalog() {
        var sorting = registry.catalog().stream()
                .map(entry -> new V2Contracts.CatalogEntry(entry.id(), entry.name(), SORTING, "2.0",
                        new V2Contracts.SortingConstraints(SORTING, 1, entry.inputConstraints().maxInputItems(),
                                Integer.MIN_VALUE, Integer.MAX_VALUE)))
                .toList();
        var catalog = new java.util.ArrayList<>(sorting);
        catalog.add(new V2Contracts.CatalogEntry("bfs", "Breadth-First Search", GRAPH_TRAVERSAL, "2.0",
                new V2Contracts.GraphTraversalConstraints(GRAPH_TRAVERSAL, 1, 12, 66,
                        "^[A-Za-z0-9_-]{1,16}$", false, true, 1, 99)));
        catalog.add(new V2Contracts.CatalogEntry("dfs", "Depth-First Search", GRAPH_TRAVERSAL, "2.0",
                new V2Contracts.GraphTraversalConstraints(GRAPH_TRAVERSAL, 1, 12, 66,
                        "^[A-Za-z0-9_-]{1,16}$", false, true, 1, 99)));
        catalog.add(new V2Contracts.CatalogEntry("dijkstra", "Dijkstra's Algorithm", PATHFINDING, "2.0",
                new V2Contracts.PathfindingConstraints(PATHFINDING, 1, 12, 66,
                        "^[A-Za-z0-9_-]{1,16}$", false, true, 1, 99, 1, true)));
        return List.copyOf(catalog);
    }

    @PostMapping("/{algorithmId}/trace")
    @ResponseStatus(HttpStatus.OK)
    Object trace(@PathVariable String algorithmId, @RequestBody V2Request request) {
        if (request == null || request.kind() == null) {
            throw new IllegalArgumentException("Provide a request body with a kind");
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

    public record V2Request(String kind, List<Integer> values, List<String> nodes,
            List<V2Contracts.GraphEdge> edges, String startNode, String destination) { }
}
