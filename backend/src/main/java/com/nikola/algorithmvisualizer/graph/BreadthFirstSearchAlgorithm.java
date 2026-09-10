package com.nikola.algorithmvisualizer.graph;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonInclude;

@Service
public class BreadthFirstSearchAlgorithm {
    public Trace execute(List<String> nodes, String startNode) {
        return execute(nodes, List.of(), startNode);
    }

    public Trace execute(List<String> nodes, List<Edge> edges, String startNode) {
        return execute(nodes, edges, startNode, null);
    }

    public Trace execute(List<String> nodes, List<Edge> edges, String startNode, String destination) {
        Map<String, NodeStatus> statuses = new LinkedHashMap<>();
        nodes.forEach(node -> statuses.put(node, NodeStatus.UNREACHED));
        Map<String, List<String>> adjacency = adjacency(nodes, edges);
        Map<String, String> parents = new LinkedHashMap<>();
        List<String> traversalOrder = new ArrayList<>();
        var queue = new ArrayDeque<String>();
        List<Event> events = new ArrayList<>();

        statuses.put(startNode, NodeStatus.DISCOVERED);
        queue.add(startNode);
        int maximumQueueSize = 1;
        events.add(event(events, EventType.TRAVERSAL_INITIALIZED, "bfs-initialize",
                state(statuses, queue, traversalOrder, parents, null),
                new StartData(EventType.TRAVERSAL_INITIALIZED.name(), startNode)));

        int edgeExaminationCount = 0;
        while (!queue.isEmpty()) {
            String node = queue.remove();
            statuses.put(node, NodeStatus.ACTIVE);
            traversalOrder.add(node);
            events.add(event(events, EventType.NODE_DEQUEUED, "bfs-dequeue",
                    state(statuses, queue, traversalOrder, parents, null),
                    new NodeData(EventType.NODE_DEQUEUED.name(), node)));

            if (node.equals(destination)) {
                List<String> path = reconstructPath(parents, startNode, destination);
                List<String> unexploredNodes = nodes.stream()
                        .filter(candidate -> !traversalOrder.contains(candidate)).toList();
                events.add(event(events, EventType.PATH_RECONSTRUCTED, "bfs-reconstruct-path",
                        state(statuses, queue, traversalOrder, parents, null, path),
                        new PathData(EventType.PATH_RECONSTRUCTED.name(), destination, true,
                                path, path.size() - 1)));
                return targetedTrace(traversalOrder, parents, edgeExaminationCount, maximumQueueSize,
                        events, true, path, path.size() - 1, List.of(), unexploredNodes);
            }

            for (String neighbor : adjacency.get(node)) {
                Edge examinedEdge = new Edge(node, neighbor);
                edgeExaminationCount++;
                events.add(event(events, EventType.EDGE_EXAMINED, "bfs-examine-edge",
                        state(statuses, queue, traversalOrder, parents, examinedEdge),
                        new EdgeData(EventType.EDGE_EXAMINED.name(), node, neighbor)));
                if (statuses.get(neighbor) == NodeStatus.UNREACHED) {
                    statuses.put(neighbor, NodeStatus.DISCOVERED);
                    parents.put(neighbor, node);
                    queue.add(neighbor);
                    maximumQueueSize = Math.max(maximumQueueSize, queue.size());
                    events.add(event(events, EventType.NODE_DISCOVERED, "bfs-enqueue-neighbor",
                            state(statuses, queue, traversalOrder, parents, examinedEdge),
                            new DiscoveryData(EventType.NODE_DISCOVERED.name(), neighbor, node)));
                } else {
                    events.add(event(events, EventType.ALREADY_DISCOVERED_SKIPPED, "bfs-skip-neighbor",
                            state(statuses, queue, traversalOrder, parents, examinedEdge),
                            new EdgeData(EventType.ALREADY_DISCOVERED_SKIPPED.name(), node, neighbor)));
                }
            }

            statuses.put(node, NodeStatus.PROCESSED);
            events.add(event(events, EventType.NODE_COMPLETED, "bfs-complete-node",
                    state(statuses, queue, traversalOrder, parents, null),
                    new NodeData(EventType.NODE_COMPLETED.name(), node)));
        }

        List<String> unreachableNodes = nodes.stream()
                .filter(node -> statuses.get(node) == NodeStatus.UNREACHED).toList();
        if (destination != null) {
            events.add(event(events, EventType.PATH_RECONSTRUCTED, "bfs-reconstruct-path",
                    state(statuses, queue, traversalOrder, parents, null, List.of()),
                    new PathData(EventType.PATH_RECONSTRUCTED.name(), destination, false, List.of(), null)));
            return targetedTrace(traversalOrder, parents, edgeExaminationCount, maximumQueueSize,
                    events, false, List.of(), null, unreachableNodes, List.of());
        }
        events.add(event(events, EventType.TRAVERSAL_COMPLETED, "bfs-complete-traversal",
                state(statuses, queue, traversalOrder, parents, null),
                new CompletionData(EventType.TRAVERSAL_COMPLETED.name(), traversalOrder, unreachableNodes)));
        return new Trace(
                new Result("GRAPH_TRAVERSAL", traversalOrder, parents, unreachableNodes,
                        traversalOrder.size(), edgeExaminationCount, maximumQueueSize),
                events);
    }

    private static Trace targetedTrace(List<String> traversalOrder, Map<String, String> parents,
            int edgeExaminationCount, int maximumQueueSize, List<Event> events, boolean pathFound,
            List<String> path, Integer pathEdgeCount, List<String> unreachableNodes,
            List<String> unexploredNodes) {
        return new Trace(new Result("GRAPH_TRAVERSAL", traversalOrder, parents, unreachableNodes,
                traversalOrder.size(), edgeExaminationCount, maximumQueueSize,
                pathFound, path, pathEdgeCount, unexploredNodes), events);
    }

    private static List<String> reconstructPath(Map<String, String> parents, String startNode,
            String destination) {
        List<String> reversed = new ArrayList<>();
        String node = destination;
        while (node != null) {
            reversed.add(node);
            if (node.equals(startNode)) {
                break;
            }
            node = parents.get(node);
        }
        Collections.reverse(reversed);
        return List.copyOf(reversed);
    }

    private static Map<String, List<String>> adjacency(List<String> nodes, List<Edge> edges) {
        Map<String, List<String>> adjacency = new LinkedHashMap<>();
        for (String node : nodes) {
            List<String> neighbors = nodes.stream().filter(candidate -> edges.stream().anyMatch(edge ->
                    edge.from().equals(node) && edge.to().equals(candidate)
                            || edge.to().equals(node) && edge.from().equals(candidate))).toList();
            adjacency.put(node, neighbors);
        }
        return adjacency;
    }

    private static Event event(List<Event> events, EventType type, String line, State state, EventData data) {
        return new Event(events.size() + 1, type, line, state, data);
    }

    private static State state(Map<String, NodeStatus> statuses, ArrayDeque<String> queue,
            List<String> traversalOrder, Map<String, String> parents, Edge examinedEdge) {
        return state(statuses, queue, traversalOrder, parents, examinedEdge, null);
    }

    private static State state(Map<String, NodeStatus> statuses, ArrayDeque<String> queue,
            List<String> traversalOrder, Map<String, String> parents, Edge examinedEdge,
            List<String> selectedPath) {
        return new State("GRAPH_TRAVERSAL", statuses, List.copyOf(queue), traversalOrder, parents,
                examinedEdge, selectedPath);
    }

    public enum NodeStatus { UNREACHED, DISCOVERED, ACTIVE, PROCESSED }

    public enum EventType {
        TRAVERSAL_INITIALIZED, NODE_DEQUEUED, EDGE_EXAMINED, NODE_DISCOVERED,
        ALREADY_DISCOVERED_SKIPPED, NODE_COMPLETED, TRAVERSAL_COMPLETED, PATH_RECONSTRUCTED
    }

    public record Trace(Result result, List<Event> events) {
        public Trace { events = List.copyOf(events); }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Result(String kind, List<String> traversalOrder, Map<String, String> parents,
            List<String> unreachableNodes, int visitedNodeCount, int edgeExaminationCount,
            int maximumQueueSize, Boolean pathFound, List<String> path, Integer pathEdgeCount,
            List<String> unexploredNodes) {
        public Result(String kind, List<String> traversalOrder, Map<String, String> parents,
                List<String> unreachableNodes, int visitedNodeCount, int edgeExaminationCount,
                int maximumQueueSize) {
            this(kind, traversalOrder, parents, unreachableNodes, visitedNodeCount,
                    edgeExaminationCount, maximumQueueSize, null, null, null, null);
        }

        public Result {
            traversalOrder = List.copyOf(traversalOrder);
            parents = immutableMap(parents);
            unreachableNodes = List.copyOf(unreachableNodes);
            path = path == null ? null : List.copyOf(path);
            unexploredNodes = unexploredNodes == null ? null : List.copyOf(unexploredNodes);
        }
    }

    public record State(String kind, Map<String, NodeStatus> nodeStatuses, List<String> queue,
            List<String> traversalOrder, Map<String, String> parents, Edge examinedEdge,
            @JsonInclude(JsonInclude.Include.NON_NULL) List<String> selectedPath) {
        public State {
            nodeStatuses = immutableMap(nodeStatuses);
            queue = List.copyOf(queue);
            traversalOrder = List.copyOf(traversalOrder);
            parents = immutableMap(parents);
            selectedPath = selectedPath == null ? null : List.copyOf(selectedPath);
        }
    }

    private static <K, V> Map<K, V> immutableMap(Map<K, V> values) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(values));
    }

    public record Edge(String from, String to) { }

    public sealed interface EventData permits StartData, NodeData, EdgeData, DiscoveryData,
            CompletionData, PathData {
        String kind();
    }

    public record StartData(String kind, String startNode) implements EventData { }
    public record NodeData(String kind, String node) implements EventData { }
    public record EdgeData(String kind, String from, String to) implements EventData { }
    public record DiscoveryData(String kind, String node, String parent) implements EventData { }
    public record CompletionData(String kind, List<String> traversalOrder,
            List<String> unreachableNodes) implements EventData {
        public CompletionData {
            traversalOrder = List.copyOf(traversalOrder);
            unreachableNodes = List.copyOf(unreachableNodes);
        }
    }
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record PathData(String kind, String destination, boolean pathFound, List<String> path,
            Integer pathEdgeCount) implements EventData {
        public PathData { path = List.copyOf(path); }
    }

    public record Event(int sequence, EventType type, String pseudocodeLineId, State state,
            EventData data) { }
}
