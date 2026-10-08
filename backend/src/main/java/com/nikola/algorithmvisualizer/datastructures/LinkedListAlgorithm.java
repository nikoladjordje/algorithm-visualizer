package com.nikola.algorithmvisualizer.datastructures;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class LinkedListAlgorithm {
    public record Operation(String kind, String value) { }
    public record Node(long occurrenceId, String value, Long nextOccurrenceId) { }
    public record State(String kind, List<Node> nodes, Long headOccurrenceId, int activeOperationIndex,
            Long allocatedOccurrenceId, Long linkedOccurrenceId) {
        public State { nodes = List.copyOf(nodes); }
    }
    public record EventData(String kind, String value, long occurrenceId, Long nextOccurrenceId) { }
    public record Event(int sequence, String type, String pseudocodeLineId, State state, EventData data) { }
    public record Result(String kind, List<Node> nodes, Long headOccurrenceId, List<String> outcomes) {
        public Result { nodes = List.copyOf(nodes); outcomes = List.copyOf(outcomes); }
    }
    public record Trace(Result result, List<Event> events) { public Trace { events = List.copyOf(events); } }

    public Trace execute(List<Operation> operations) {
        var nodes = new ArrayList<Node>();
        var events = new ArrayList<Event>();
        var outcomes = new ArrayList<String>();
        Long head = null;
        long nextId = 1;
        int sequence = 1;
        for (int operationIndex = 0; operationIndex < operations.size(); operationIndex++) {
            Operation operation = operations.get(operationIndex);
            long nodeId = nextId++;
            nodes.add(new Node(nodeId, operation.value(), null));
            events.add(event(sequence++, "NODE_ALLOCATED", "linked-list-allocate", nodes, head, operationIndex,
                    nodeId, null, operation.value(), null));

            replace(nodes, nodeId, new Node(nodeId, operation.value(), head));
            events.add(event(sequence++, "NEXT_INITIALIZED", "linked-list-initialize-next", nodes, head,
                    operationIndex, nodeId, nodeId, operation.value(), head));

            head = nodeId;
            events.add(event(sequence++, "HEAD_MOVED", "linked-list-move-head", nodes, head, operationIndex,
                    nodeId, nodeId, operation.value(), find(nodes, nodeId).nextOccurrenceId()));
            outcomes.add(operation.value());
        }
        return new Trace(new Result("LINKED_LIST", nodes, head, outcomes), events);
    }

    private static Event event(int sequence, String type, String line, List<Node> nodes, Long head,
            int operationIndex, long nodeId, Long linkedNodeId, String value, Long nextId) {
        return new Event(sequence, type, line,
                new State("LINKED_LIST", nodes, head, operationIndex, nodeId, linkedNodeId),
                new EventData(type, value, nodeId, nextId));
    }

    private static Node find(List<Node> nodes, long id) {
        return nodes.stream().filter(node -> node.occurrenceId() == id).findFirst().orElseThrow();
    }

    private static void replace(List<Node> nodes, long id, Node replacement) {
        for (int index = 0; index < nodes.size(); index++) {
            if (nodes.get(index).occurrenceId() == id) {
                nodes.set(index, replacement);
                return;
            }
        }
    }
}
