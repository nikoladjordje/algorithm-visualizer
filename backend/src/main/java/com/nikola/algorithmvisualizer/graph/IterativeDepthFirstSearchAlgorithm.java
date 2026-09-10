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
        Map<String, NodeStatus> statuses = new LinkedHashMap<>();
        nodes.forEach(node -> statuses.put(node, NodeStatus.UNREACHED));
        Map<String, String> parents = new LinkedHashMap<>();
        List<String> traversalOrder = new ArrayList<>();
        var stack = new ArrayDeque<String>();
        List<Event> events = new ArrayList<>();

        statuses.put(startNode, NodeStatus.DISCOVERED);
        stack.push(startNode);
        events.add(event(events, EventType.TRAVERSAL_INITIALIZED, "dfs-initialize",
                state(statuses, stack, traversalOrder, parents),
                new StartData(EventType.TRAVERSAL_INITIALIZED.name(), startNode)));

        String node = stack.pop();
        statuses.put(node, NodeStatus.ACTIVE);
        traversalOrder.add(node);
        events.add(event(events, EventType.NODE_POPPED, "dfs-pop",
                state(statuses, stack, traversalOrder, parents),
                new NodeData(EventType.NODE_POPPED.name(), node)));

        statuses.put(node, NodeStatus.PROCESSED);
        events.add(event(events, EventType.NODE_COMPLETED, "dfs-complete-node",
                state(statuses, stack, traversalOrder, parents),
                new NodeData(EventType.NODE_COMPLETED.name(), node)));

        List<String> unreachableNodes = nodes.stream()
                .filter(candidate -> statuses.get(candidate) == NodeStatus.UNREACHED)
                .toList();
        events.add(event(events, EventType.TRAVERSAL_COMPLETED, "dfs-complete-traversal",
                state(statuses, stack, traversalOrder, parents),
                new CompletionData(EventType.TRAVERSAL_COMPLETED.name(), traversalOrder, unreachableNodes)));

        return new Trace(new Result("GRAPH_TRAVERSAL", traversalOrder, parents, unreachableNodes,
                traversalOrder.size(), 0, 1), events);
    }

    private static Event event(List<Event> events, EventType type, String line, State state, EventData data) {
        return new Event(events.size() + 1, type, line, state, data);
    }

    private static State state(Map<String, NodeStatus> statuses, ArrayDeque<String> stack,
            List<String> traversalOrder, Map<String, String> parents) {
        return new State("GRAPH_TRAVERSAL", statuses, List.copyOf(stack), traversalOrder, parents, null);
    }

    public enum NodeStatus { UNREACHED, DISCOVERED, ACTIVE, PROCESSED }

    public enum EventType { TRAVERSAL_INITIALIZED, NODE_POPPED, NODE_COMPLETED, TRAVERSAL_COMPLETED }

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

    public sealed interface EventData permits StartData, NodeData, CompletionData {
        String kind();
    }

    public record StartData(String kind, String startNode) implements EventData { }
    public record NodeData(String kind, String node) implements EventData { }
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
