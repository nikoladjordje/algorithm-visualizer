package com.nikola.algorithmvisualizer.graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonInclude;

@Service
public class DijkstraPathfindingAlgorithm {

    public Trace execute(List<String> nodes, List<Edge> edges, String startNode, String destination) {
        Map<String, Integer> declarationOrder = new LinkedHashMap<>();
        Map<String, NodeStatus> statuses = new LinkedHashMap<>();
        Map<String, Integer> distances = new LinkedHashMap<>();
        for (int index = 0; index < nodes.size(); index++) {
            declarationOrder.put(nodes.get(index), index);
            statuses.put(nodes.get(index), NodeStatus.UNREACHED);
            distances.put(nodes.get(index), null);
        }
        Map<String, List<Neighbor>> adjacency = adjacency(nodes, edges, declarationOrder);
        Map<String, String> parents = new LinkedHashMap<>();
        Comparator<FrontierEntry> comparator = Comparator.comparingInt(FrontierEntry::distance)
                .thenComparingInt(entry -> declarationOrder.get(entry.node()));
        PriorityQueue<FrontierEntry> queue = new PriorityQueue<>(comparator);
        List<Event> events = new ArrayList<>();
        List<String> settledOrder = new ArrayList<>();

        distances.put(startNode, 0);
        statuses.put(startNode, NodeStatus.FRONTIER);
        queue.add(new FrontierEntry(startNode, 0));
        int maximumFrontierSize = 1;
        int relaxationAttemptCount = 0;
        int successfulUpdateCount = 0;
        int rejectedUpdateCount = 0;
        events.add(event(events, EventType.PATHFINDING_INITIALIZED, "dijkstra-initialize",
                state(statuses, distances, parents, queue, declarationOrder, null, null),
                new InitializationData(EventType.PATHFINDING_INITIALIZED.name(), startNode, destination)));

        while (!queue.isEmpty()) {
            FrontierEntry entry = queue.remove();
            Integer currentDistance = distances.get(entry.node());
            if (statuses.get(entry.node()) == NodeStatus.SETTLED
                    || !Integer.valueOf(entry.distance()).equals(currentDistance)) {
                events.add(event(events, EventType.STALE_FRONTIER_ENTRY_SKIPPED, "dijkstra-skip-stale",
                        state(statuses, distances, parents, queue, declarationOrder, null, null),
                        new StaleEntryData(EventType.STALE_FRONTIER_ENTRY_SKIPPED.name(), entry.node(),
                                entry.distance(), currentDistance)));
                continue;
            }

            String node = entry.node();
            statuses.put(node, NodeStatus.ACTIVE);
            events.add(event(events, EventType.NODE_SELECTED, "dijkstra-select-node",
                    state(statuses, distances, parents, queue, declarationOrder, null, null),
                    new NodeDistanceData(EventType.NODE_SELECTED.name(), node, entry.distance())));

            statuses.put(node, NodeStatus.SETTLED);
            settledOrder.add(node);
            events.add(event(events, EventType.NODE_SETTLED, "dijkstra-settle-node",
                    state(statuses, distances, parents, queue, declarationOrder, null, null),
                    new NodeDistanceData(EventType.NODE_SETTLED.name(), node, entry.distance())));

            if (node.equals(destination)) {
                List<String> path = reconstructPath(parents, startNode, destination);
                events.add(event(events, EventType.PATH_RECONSTRUCTED, "dijkstra-reconstruct-path",
                        state(statuses, distances, parents, queue, declarationOrder, null, path),
                        new PathData(EventType.PATH_RECONSTRUCTED.name(), destination, true, path,
                                entry.distance())));
                return trace(settledOrder, parents, events, true, path, entry.distance(),
                        relaxationAttemptCount, successfulUpdateCount, rejectedUpdateCount,
                        maximumFrontierSize);
            }

            for (Neighbor neighbor : adjacency.get(node)) {
                int candidateCost = entry.distance() + neighbor.weight();
                Integer knownCost = distances.get(neighbor.node());
                relaxationAttemptCount++;
                Edge examinedEdge = new Edge(node, neighbor.node(), neighbor.weight());
                events.add(event(events, EventType.EDGE_EXAMINED, "dijkstra-examine-edge",
                        state(statuses, distances, parents, queue, declarationOrder, examinedEdge, null),
                        new RelaxationData(EventType.EDGE_EXAMINED.name(), node, neighbor.node(),
                                neighbor.weight(), candidateCost, knownCost)));

                if (statuses.get(neighbor.node()) != NodeStatus.SETTLED
                        && (knownCost == null || candidateCost < knownCost)) {
                    distances.put(neighbor.node(), candidateCost);
                    parents.put(neighbor.node(), node);
                    statuses.put(neighbor.node(), NodeStatus.FRONTIER);
                    queue.add(new FrontierEntry(neighbor.node(), candidateCost));
                    successfulUpdateCount++;
                    maximumFrontierSize = Math.max(maximumFrontierSize,
                            frontier(queue, statuses, distances, declarationOrder).size());
                    events.add(event(events, EventType.DISTANCE_UPDATED, "dijkstra-update-distance",
                            state(statuses, distances, parents, queue, declarationOrder, examinedEdge, null),
                            new DistanceUpdateData(EventType.DISTANCE_UPDATED.name(), neighbor.node(), node,
                                    knownCost, candidateCost)));
                } else {
                    rejectedUpdateCount++;
                    events.add(event(events, EventType.RELAXATION_REJECTED, "dijkstra-reject-relaxation",
                            state(statuses, distances, parents, queue, declarationOrder, examinedEdge, null),
                            new RelaxationData(EventType.RELAXATION_REJECTED.name(), node, neighbor.node(),
                                    neighbor.weight(), candidateCost, knownCost)));
                }
            }
        }

        events.add(event(events, EventType.PATH_RECONSTRUCTED, "dijkstra-reconstruct-path",
                state(statuses, distances, parents, queue, declarationOrder, null, List.of()),
                new PathData(EventType.PATH_RECONSTRUCTED.name(), destination, false, List.of(), null)));
        return trace(settledOrder, parents, events, false, List.of(), null, relaxationAttemptCount,
                successfulUpdateCount, rejectedUpdateCount, maximumFrontierSize);
    }

    private static Trace trace(List<String> settledOrder, Map<String, String> parents, List<Event> events,
            boolean pathFound, List<String> path, Integer totalCost, int relaxationAttemptCount,
            int successfulUpdateCount, int rejectedUpdateCount, int maximumFrontierSize) {
        return new Trace(new Result("PATHFINDING", pathFound, path, totalCost, settledOrder, parents,
                settledOrder.size(), relaxationAttemptCount, successfulUpdateCount, rejectedUpdateCount,
                maximumFrontierSize), events);
    }

    private static Map<String, List<Neighbor>> adjacency(List<String> nodes, List<Edge> edges,
            Map<String, Integer> declarationOrder) {
        Map<String, List<Neighbor>> adjacency = new LinkedHashMap<>();
        nodes.forEach(node -> adjacency.put(node, new ArrayList<>()));
        for (Edge edge : edges) {
            adjacency.get(edge.from()).add(new Neighbor(edge.to(), edge.weight()));
            adjacency.get(edge.to()).add(new Neighbor(edge.from(), edge.weight()));
        }
        adjacency.values().forEach(neighbors -> neighbors.sort(
                Comparator.comparingInt(neighbor -> declarationOrder.get(neighbor.node()))));
        return adjacency;
    }

    private static State state(Map<String, NodeStatus> statuses, Map<String, Integer> distances,
            Map<String, String> parents, PriorityQueue<FrontierEntry> queue,
            Map<String, Integer> declarationOrder, Edge examinedEdge, List<String> selectedPath) {
        return new State("PATHFINDING", statuses, distances, parents,
                frontier(queue, statuses, distances, declarationOrder), examinedEdge, selectedPath);
    }

    private static List<FrontierEntry> frontier(PriorityQueue<FrontierEntry> queue,
            Map<String, NodeStatus> statuses, Map<String, Integer> distances,
            Map<String, Integer> declarationOrder) {
        Set<String> included = new HashSet<>();
        return queue.stream()
                .filter(entry -> statuses.get(entry.node()) != NodeStatus.SETTLED)
                .filter(entry -> Integer.valueOf(entry.distance()).equals(distances.get(entry.node())))
                .sorted(Comparator.comparingInt(FrontierEntry::distance)
                        .thenComparingInt(entry -> declarationOrder.get(entry.node())))
                .filter(entry -> included.add(entry.node()))
                .toList();
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

    private static Event event(List<Event> events, EventType type, String pseudocodeLineId,
            State state, EventData data) {
        return new Event(events.size() + 1, type, pseudocodeLineId, state, data);
    }

    private static <K, V> Map<K, V> immutableMapAllowingNulls(Map<K, V> values) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(values));
    }

    public enum NodeStatus { UNREACHED, FRONTIER, ACTIVE, SETTLED }

    public enum EventType {
        PATHFINDING_INITIALIZED, NODE_SELECTED, NODE_SETTLED, EDGE_EXAMINED,
        DISTANCE_UPDATED, RELAXATION_REJECTED, STALE_FRONTIER_ENTRY_SKIPPED, PATH_RECONSTRUCTED
    }

    public record Edge(String from, String to, int weight) { }

    private record Neighbor(String node, int weight) { }

    public record FrontierEntry(String node, int distance) { }

    public record Trace(Result result, List<Event> events) {
        public Trace { events = List.copyOf(events); }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Result(String kind, boolean pathFound, List<String> path, Integer totalCost,
            List<String> settledOrder, Map<String, String> parents, int settledNodeCount,
            int relaxationAttemptCount, int successfulUpdateCount, int rejectedUpdateCount,
            int maximumFrontierSize) {
        public Result {
            path = List.copyOf(path);
            settledOrder = List.copyOf(settledOrder);
            parents = immutableMapAllowingNulls(parents);
        }
    }

    public record State(String kind, Map<String, NodeStatus> nodeStatuses,
            Map<String, Integer> tentativeDistances, Map<String, String> parents,
            List<FrontierEntry> frontier, Edge examinedEdge,
            @JsonInclude(JsonInclude.Include.NON_NULL) List<String> selectedPath) {
        public State {
            nodeStatuses = immutableMapAllowingNulls(nodeStatuses);
            tentativeDistances = immutableMapAllowingNulls(tentativeDistances);
            parents = immutableMapAllowingNulls(parents);
            frontier = List.copyOf(frontier);
            selectedPath = selectedPath == null ? null : List.copyOf(selectedPath);
        }
    }

    public sealed interface EventData permits InitializationData, NodeDistanceData, RelaxationData,
            DistanceUpdateData, StaleEntryData, PathData {
        String kind();
    }

    public record InitializationData(String kind, String startNode, String destination)
            implements EventData { }

    public record NodeDistanceData(String kind, String node, int distance) implements EventData { }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RelaxationData(String kind, String from, String to, int weight,
            int candidateCost, Integer currentKnownCost) implements EventData { }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DistanceUpdateData(String kind, String node, String parent,
            Integer previousDistance, int newDistance) implements EventData { }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record StaleEntryData(String kind, String node, int queuedDistance,
            Integer currentDistance) implements EventData { }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record PathData(String kind, String destination, boolean pathFound, List<String> path,
            Integer totalCost) implements EventData {
        public PathData { path = List.copyOf(path); }
    }

    public record Event(int sequence, EventType type, String pseudocodeLineId, State state,
            EventData data) { }
}
