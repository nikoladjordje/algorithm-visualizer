package com.nikola.algorithmvisualizer.graph;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class IterativeDepthFirstSearchAlgorithm {
    public Trace execute(List<String> nodes, String startNode) {
        return execute(nodes, List.of(), startNode);
    }

    public Trace execute(List<String> nodes, List<Edge> edges, String startNode) {
        Map<String, NodeStatus> statuses = new LinkedHashMap<>();
        nodes.forEach(node -> statuses.put(node, NodeStatus.UNREACHED));
        Map<String, List<String>> adjacency = adjacency(nodes, edges);
        Map<String, String> parents = new LinkedHashMap<>();
        List<String> traversalOrder = new ArrayList<>();
        var stack = new ArrayDeque<String>();
        List<Event> events = new ArrayList<>();

        statuses.put(startNode, NodeStatus.DISCOVERED);
        stack.push(startNode);
        events.add(event(events, EventType.TRAVERSAL_INITIALIZED, "dfs-initialize",
                state(statuses, stack, traversalOrder, parents, null),
                new StartData(EventType.TRAVERSAL_INITIALIZED.name(), startNode)));

        int maximumStackSize = 1;
        int edgeExaminationCount = 0;
        while (!stack.isEmpty()) {
            String node = stack.pop();
            statuses.put(node, NodeStatus.ACTIVE);
            traversalOrder.add(node);
            events.add(event(events, EventType.NODE_POPPED, "dfs-pop",
                    state(statuses, stack, traversalOrder, parents, null),
                    new NodeData(EventType.NODE_POPPED.name(), node)));

            List<String> neighbors = adjacency.get(node);
            for (int index = neighbors.size() - 1; index >= 0; index--) {
                String neighbor = neighbors.get(index);
                Edge examinedEdge = new Edge(node, neighbor);
                edgeExaminationCount++;
                events.add(event(events, EventType.EDGE_EXAMINED, "dfs-examine-edge",
                        state(statuses, stack, traversalOrder, parents, examinedEdge),
                        new EdgeData(EventType.EDGE_EXAMINED.name(), node, neighbor)));
                if (statuses.get(neighbor) == NodeStatus.UNREACHED) {
                    statuses.put(neighbor, NodeStatus.DISCOVERED);
                    parents.put(neighbor, node);
                    stack.push(neighbor);
                    maximumStackSize = Math.max(maximumStackSize, stack.size());
                    events.add(event(events, EventType.NODE_DISCOVERED, "dfs-push-neighbor",
                            state(statuses, stack, traversalOrder, parents, examinedEdge),
                            new DiscoveryData(EventType.NODE_DISCOVERED.name(), neighbor, node)));
                } else {
                    events.add(event(events, EventType.ALREADY_DISCOVERED_SKIPPED, "dfs-skip-neighbor",
                            state(statuses, stack, traversalOrder, parents, examinedEdge),
                            new EdgeData(EventType.ALREADY_DISCOVERED_SKIPPED.name(), node, neighbor)));
                }
            }

            statuses.put(node, NodeStatus.PROCESSED);
            events.add(event(events, EventType.NODE_COMPLETED, "dfs-complete-node",
                    state(statuses, stack, traversalOrder, parents, null),
                    new NodeData(EventType.NODE_COMPLETED.name(), node)));
        }

        List<String> unreachableNodes = nodes.stream()
                .filter(candidate -> statuses.get(candidate) == NodeStatus.UNREACHED)
                .toList();
        events.add(event(events, EventType.TRAVERSAL_COMPLETED, "dfs-complete-traversal",
                state(statuses, stack, traversalOrder, parents, null),
                new CompletionData(EventType.TRAVERSAL_COMPLETED.name(), traversalOrder, unreachableNodes)));

        return new Trace(new Result("GRAPH_TRAVERSAL", traversalOrder, parents, unreachableNodes,
                traversalOrder.size(), edgeExaminationCount, maximumStackSize), events);
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

    private static State state(Map<String, NodeStatus> statuses, ArrayDeque<String> stack,
            List<String> traversalOrder, Map<String, String> parents, Edge examinedEdge) {
        return new State("GRAPH_TRAVERSAL", statuses, List.copyOf(stack), traversalOrder, parents, examinedEdge);
    }

    public enum NodeStatus { UNREACHED, DISCOVERED, ACTIVE, PROCESSED }

    public enum EventType {
        TRAVERSAL_INITIALIZED, NODE_POPPED, EDGE_EXAMINED, NODE_DISCOVERED,
        ALREADY_DISCOVERED_SKIPPED, NODE_COMPLETED, TRAVERSAL_COMPLETED
    }

    public record Trace(Result result, List<Event> events) {
        public Trace { events = List.copyOf(events); }
    }

    public record Result(String kind, List<String> traversalOrder, Map<String, String> parents,
            List<String> unreachableNodes, int visitedNodeCount, int edgeExaminationCount,
            int maximumStackSize) {
        public Result {
            traversalOrder = List.copyOf(traversalOrder);
            parents = immutableMap(parents);
            unreachableNodes = List.copyOf(unreachableNodes);
        }
    }

    public record State(String kind, Map<String, NodeStatus> nodeStatuses, List<String> stack,
            List<String> traversalOrder, Map<String, String> parents, Edge examinedEdge) {
        public State {
            nodeStatuses = immutableMap(nodeStatuses);
            stack = List.copyOf(stack);
            traversalOrder = List.copyOf(traversalOrder);
            parents = immutableMap(parents);
        }
    }

    private static <K, V> Map<K, V> immutableMap(Map<K, V> values) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(values));
    }

    public record Edge(String from, String to) { }

    public sealed interface EventData permits StartData, NodeData, EdgeData, DiscoveryData, CompletionData {
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

    public record Event(int sequence, EventType type, String pseudocodeLineId, State state,
            EventData data) { }
}
