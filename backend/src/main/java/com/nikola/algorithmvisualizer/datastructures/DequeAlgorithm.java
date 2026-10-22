package com.nikola.algorithmvisualizer.datastructures;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DequeAlgorithm {
    public record Operation(String kind, String value) { }
    public record State(String kind, List<DoublyLinkedListAlgorithm.Node> nodes, Long frontOccurrenceId,
            Long rearOccurrenceId, int activeOperationIndex, Long allocatedOccurrenceId, Long linkedOccurrenceId) {
        public State { nodes = List.copyOf(nodes); }
    }
    public record Event(int sequence, String type, String pseudocodeLineId, State state,
            DoublyLinkedListAlgorithm.EventData data) { }
    public record Result(String kind, List<DoublyLinkedListAlgorithm.Node> nodes, Long frontOccurrenceId,
            Long rearOccurrenceId, int size, List<String> outcomes) {
        public Result { nodes = List.copyOf(nodes); outcomes = List.copyOf(outcomes); }
    }
    public record Trace(Result result, List<Event> events) { public Trace { events = List.copyOf(events); } }

    public Trace execute(List<Operation> operations) {
        var trace = new DoublyLinkedListAlgorithm().execute(operations.stream()
                .map(operation -> new DoublyLinkedListAlgorithm.Operation(operation.kind(), operation.value())).toList());
        var result = trace.result();
        var outcomes = new java.util.ArrayList<>(result.outcomes());
        for (var event : trace.events()) {
            if ("EMPTY_REMOVAL".equals(event.type())) {
                outcomes.set(event.state().activeOperationIndex(), "Nothing to remove: the deque is empty");
            }
            if ("NODE_ALLOCATED".equals(event.type())) {
                int index = event.state().activeOperationIndex();
                var operation = operations.get(index);
                outcomes.set(index, "Added " + operation.value() + " at "
                        + ("ADD_FIRST".equals(operation.kind()) ? "front" : "rear")
                        + " (node " + event.data().occurrenceId() + ")");
            }
        }
        return new Trace(new Result("DEQUE", result.nodes(), result.headOccurrenceId(), result.tailOccurrenceId(),
                result.size(), outcomes), trace.events().stream().map(event -> {
                    var state = event.state();
                    return new Event(event.sequence(), event.type(), event.pseudocodeLineId(),
                            new State("DEQUE", state.nodes(), state.headOccurrenceId(), state.tailOccurrenceId(),
                                    state.activeOperationIndex(), state.allocatedOccurrenceId(), state.linkedOccurrenceId()), event.data());
                }).toList());
    }
}
