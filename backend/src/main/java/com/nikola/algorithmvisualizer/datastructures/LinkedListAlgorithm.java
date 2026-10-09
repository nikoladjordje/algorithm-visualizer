package com.nikola.algorithmvisualizer.datastructures;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class LinkedListAlgorithm {
    public record Operation(String kind, String value) { }
    public record Node(long occurrenceId, String value, Long nextOccurrenceId) { }
    public record State(String kind, List<Node> nodes, Long headOccurrenceId, int activeOperationIndex,
            Long allocatedOccurrenceId, Long inspectedOccurrenceId, Long linkedOccurrenceId,
            Long matchedOccurrenceId) {
        public State { nodes = List.copyOf(nodes); }
    }
    public record EventData(String kind, String value, Long occurrenceId, Long nextOccurrenceId) { }
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
            if ("FIND".equals(operation.kind())) {
                Long currentId = head;
                while (currentId != null) {
                    Node current = find(nodes, currentId);
                    events.add(event(sequence++, "NODE_INSPECTED", "linked-list-inspect-node", nodes, head,
                            operationIndex, null, currentId, null, null, currentId, current.value(),
                            current.nextOccurrenceId()));
                    if (operation.value().equals(current.value())) {
                        events.add(event(sequence++, "NODE_MATCHED", "linked-list-match", nodes, head,
                                operationIndex, null, currentId, null, currentId, currentId, current.value(),
                                current.nextOccurrenceId()));
                        outcomes.add("Found " + operation.value() + " at node " + currentId);
                        break;
                    }
                    currentId = current.nextOccurrenceId();
                }
                if (currentId == null) {
                    events.add(event(sequence++, "SEARCH_NOT_FOUND", "linked-list-not-found", nodes, head,
                            operationIndex, null, null, null, null, null, operation.value(), null));
                    outcomes.add("Not found: " + operation.value());
                }
                continue;
            }
            long nodeId = nextId++;
            nodes.add(new Node(nodeId, operation.value(), null));
            events.add(event(sequence++, "NODE_ALLOCATED", "linked-list-allocate", nodes, head, operationIndex,
                    nodeId, null, null, null, nodeId, operation.value(), null));

            if ("APPEND".equals(operation.kind())) {
                if (head == null) {
                    head = nodeId;
                    events.add(event(sequence++, "HEAD_MOVED", "linked-list-establish-head", nodes, head,
                            operationIndex, nodeId, null, nodeId, null, nodeId, operation.value(), null));
                } else {
                    long currentId = head;
                    while (true) {
                        Node current = find(nodes, currentId);
                        events.add(event(sequence++, "NODE_INSPECTED", "linked-list-inspect-node", nodes, head,
                                operationIndex, nodeId, currentId, null, null, currentId, current.value(), current.nextOccurrenceId()));
                        if (current.nextOccurrenceId() == null) {
                            replace(nodes, currentId, new Node(currentId, current.value(), nodeId));
                            events.add(event(sequence++, "FINAL_LINK_CREATED", "linked-list-link-final-node", nodes,
                                    head, operationIndex, nodeId, currentId, currentId, null, currentId, current.value(), nodeId));
                            break;
                        }
                        currentId = current.nextOccurrenceId();
                    }
                }
                outcomes.add(operation.value());
                continue;
            }

            replace(nodes, nodeId, new Node(nodeId, operation.value(), head));
            events.add(event(sequence++, "NEXT_INITIALIZED", "linked-list-initialize-next", nodes, head,
                    operationIndex, nodeId, null, nodeId, null, nodeId, operation.value(), head));

            head = nodeId;
            events.add(event(sequence++, "HEAD_MOVED", "linked-list-move-head", nodes, head, operationIndex,
                    nodeId, null, nodeId, null, nodeId, operation.value(), find(nodes, nodeId).nextOccurrenceId()));
            outcomes.add(operation.value());
        }
        return new Trace(new Result("LINKED_LIST", nodes, head, outcomes), events);
    }

    private static Event event(int sequence, String type, String line, List<Node> nodes, Long head,
            int operationIndex, Long allocatedNodeId, Long inspectedNodeId, Long linkedNodeId, Long matchedNodeId, Long dataNodeId,
            String value, Long nextId) {
        return new Event(sequence, type, line,
                new State("LINKED_LIST", nodes, head, operationIndex, allocatedNodeId, inspectedNodeId, linkedNodeId, matchedNodeId),
                new EventData(type, value, dataNodeId, nextId));
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
