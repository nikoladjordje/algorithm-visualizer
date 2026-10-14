package com.nikola.algorithmvisualizer.datastructures;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class DoublyLinkedListAlgorithm {
    public record Operation(String kind, String value) { }
    public record Node(long occurrenceId, String value, Long nextOccurrenceId, Long prevOccurrenceId) { }
    public record State(String kind, List<Node> nodes, Long headOccurrenceId, Long tailOccurrenceId,
            int activeOperationIndex, Long allocatedOccurrenceId, Long linkedOccurrenceId) {
        public State { nodes = List.copyOf(nodes); }
    }
    public record EventData(String kind, String value, Long occurrenceId, Long relatedOccurrenceId) { }
    public record Event(int sequence, String type, String pseudocodeLineId, State state, EventData data) { }
    public record Result(String kind, List<Node> nodes, Long headOccurrenceId, Long tailOccurrenceId,
            int size, List<String> outcomes) {
        public Result { nodes = List.copyOf(nodes); outcomes = List.copyOf(outcomes); }
    }
    public record Trace(Result result, List<Event> events) { public Trace { events = List.copyOf(events); } }

    public Trace execute(List<Operation> operations) {
        var nodes = new LinkedHashMap<Long, Node>();
        var events = new ArrayList<Event>();
        var outcomes = new ArrayList<String>();
        Long head = null, tail = null;
        long nextId = 1;
        int sequence = 1;
        for (int index = 0; index < operations.size(); index++) {
            var operation = operations.get(index);
            long nodeId = nextId++;
            nodes.put(nodeId, new Node(nodeId, operation.value(), null, null));
            events.add(event(sequence++, "NODE_ALLOCATED", "doubly-linked-list-allocate", nodes, head, tail, index,
                    nodeId, null, nodeId, operation.value(), null));
            if (head == null) {
                head = nodeId;
                tail = nodeId;
                events.add(event(sequence++, "ENDPOINTS_ESTABLISHED", "doubly-linked-list-establish-endpoints", nodes,
                        head, tail, index, nodeId, nodeId, nodeId, operation.value(), null));
            } else if ("PREPEND".equals(operation.kind())) {
                replace(nodes, nodeId, new Node(nodeId, operation.value(), head, null));
                events.add(event(sequence++, "NEXT_ASSIGNED", "doubly-linked-list-link-new-head", nodes, head, tail,
                        index, nodeId, nodeId, nodeId, operation.value(), head));
                var formerHead = find(nodes, head);
                replace(nodes, head, new Node(formerHead.occurrenceId(), formerHead.value(), formerHead.nextOccurrenceId(), nodeId));
                events.add(event(sequence++, "PREV_ASSIGNED", "doubly-linked-list-link-former-head", nodes, head, tail,
                        index, nodeId, head, head, formerHead.value(), nodeId));
                head = nodeId;
                events.add(event(sequence++, "HEAD_MOVED", "doubly-linked-list-move-head", nodes, head, tail, index,
                        nodeId, nodeId, nodeId, operation.value(), null));
            } else {
                replace(nodes, nodeId, new Node(nodeId, operation.value(), null, tail));
                events.add(event(sequence++, "PREV_ASSIGNED", "doubly-linked-list-link-new-tail", nodes, head, tail,
                        index, nodeId, nodeId, nodeId, operation.value(), tail));
                var formerTail = find(nodes, tail);
                replace(nodes, tail, new Node(formerTail.occurrenceId(), formerTail.value(), nodeId, formerTail.prevOccurrenceId()));
                events.add(event(sequence++, "NEXT_ASSIGNED", "doubly-linked-list-link-former-tail", nodes, head, tail,
                        index, nodeId, tail, tail, formerTail.value(), nodeId));
                tail = nodeId;
                events.add(event(sequence++, "TAIL_MOVED", "doubly-linked-list-move-tail", nodes, head, tail, index,
                        nodeId, nodeId, nodeId, operation.value(), null));
            }
            outcomes.add(operation.value());
        }
        return new Trace(new Result("DOUBLY_LINKED_LIST", ordered(nodes, head), head, tail, nodes.size(), outcomes), events);
    }

    private static Event event(int sequence, String type, String line, Map<Long, Node> nodes, Long head, Long tail,
            int index, Long allocated, Long linked, Long occurrenceId, String value, Long relatedId) {
        return new Event(sequence, type, line, new State("DOUBLY_LINKED_LIST", new ArrayList<>(nodes.values()), head, tail, index, allocated, linked),
                new EventData(type, value, occurrenceId, relatedId));
    }

    private static List<Node> ordered(Map<Long, Node> nodes, Long head) {
        var ordered = new ArrayList<Node>();
        Long current = head;
        while (current != null) { var node = find(nodes, current); ordered.add(node); current = node.nextOccurrenceId(); }
        return ordered;
    }

    private static Node find(Map<Long, Node> nodes, long id) {
        Node node = nodes.get(id);
        if (node == null) throw new IllegalArgumentException("Unknown node " + id);
        return node;
    }

    private static void replace(Map<Long, Node> nodes, long id, Node replacement) {
        nodes.put(id, replacement);
    }
}
