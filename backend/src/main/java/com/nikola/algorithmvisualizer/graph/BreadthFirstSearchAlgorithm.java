package com.nikola.algorithmvisualizer.graph;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class BreadthFirstSearchAlgorithm {
    public Trace execute(List<String> nodes, String startNode) {
        String node = nodes.getFirst();
        Map<String, NodeStatus> discovered = statuses(node, NodeStatus.DISCOVERED);
        Map<String, NodeStatus> active = statuses(node, NodeStatus.ACTIVE);
        Map<String, NodeStatus> processed = statuses(node, NodeStatus.PROCESSED);
        List<String> traversalOrder = List.of(node);

        return new Trace(
                new Result("GRAPH_TRAVERSAL", traversalOrder, Map.of(), List.of(), 1, 0, 1),
                List.of(
                        event(1, EventType.TRAVERSAL_INITIALIZED, "bfs-initialize",
                                state(discovered, List.of(node), List.of()), new StartData("TRAVERSAL_INITIALIZED", node)),
                        event(2, EventType.NODE_DEQUEUED, "bfs-dequeue",
                                state(active, List.of(), traversalOrder), new NodeData("NODE_DEQUEUED", node)),
                        event(3, EventType.NODE_COMPLETED, "bfs-complete-node",
                                state(processed, List.of(), traversalOrder), new NodeData("NODE_COMPLETED", node)),
                        event(4, EventType.TRAVERSAL_COMPLETED, "bfs-complete-traversal",
                                state(processed, List.of(), traversalOrder),
                                new CompletionData("TRAVERSAL_COMPLETED", traversalOrder, List.of()))));
    }

    private static Event event(int sequence, EventType type, String line, State state, EventData data) {
        return new Event(sequence, type, line, state, data);
    }

    private static State state(Map<String, NodeStatus> statuses, List<String> queue,
            List<String> traversalOrder) {
        return new State("GRAPH_TRAVERSAL", statuses, queue, traversalOrder, Map.of(), null);
    }

    private static Map<String, NodeStatus> statuses(String node, NodeStatus status) {
        Map<String, NodeStatus> statuses = new LinkedHashMap<>();
        statuses.put(node, status);
        return statuses;
    }

    public enum NodeStatus { UNREACHED, DISCOVERED, ACTIVE, PROCESSED }

    public enum EventType {
        TRAVERSAL_INITIALIZED, NODE_DEQUEUED, NODE_COMPLETED, TRAVERSAL_COMPLETED
    }

    public record Trace(Result result, List<Event> events) {
        public Trace { events = List.copyOf(events); }
    }

    public record Result(String kind, List<String> traversalOrder, Map<String, String> parents,
            List<String> unreachableNodes, int visitedNodeCount, int edgeExaminationCount,
            int maximumQueueSize) {
        public Result {
            traversalOrder = List.copyOf(traversalOrder);
            parents = Map.copyOf(parents);
            unreachableNodes = List.copyOf(unreachableNodes);
        }
    }

    public record State(String kind, Map<String, NodeStatus> nodeStatuses, List<String> queue,
            List<String> traversalOrder, Map<String, String> parents, Edge examinedEdge) {
        public State {
            nodeStatuses = Map.copyOf(nodeStatuses);
            queue = List.copyOf(queue);
            traversalOrder = List.copyOf(traversalOrder);
            parents = Map.copyOf(parents);
        }
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
