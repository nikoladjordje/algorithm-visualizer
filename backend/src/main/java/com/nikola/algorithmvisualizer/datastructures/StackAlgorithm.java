package com.nikola.algorithmvisualizer.datastructures;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class StackAlgorithm {
    public record Operation(String kind, String value) { }
    public record Value(long occurrenceId, String value) { }
    public record State(String kind, List<String> values, List<Long> occurrenceIds, int activeOperationIndex) {
        public State { values = List.copyOf(values); occurrenceIds = List.copyOf(occurrenceIds); }
    }
    public record EventData(String kind, String operation, String value, Long occurrenceId, String outcome) { }
    public record Event(int sequence, String type, String pseudocodeLineId, State state, EventData data) { }
    public record Result(String kind, List<String> values, List<Long> occurrenceIds, List<String> outcomes) {
        public Result { values = List.copyOf(values); occurrenceIds = List.copyOf(occurrenceIds); outcomes = List.copyOf(outcomes); }
    }
    public record Trace(Result result, List<Event> events) { public Trace { events = List.copyOf(events); } }

    public Trace execute(List<Operation> operations) {
        var stack = new ArrayList<Value>();
        var events = new ArrayList<Event>();
        var outcomes = new ArrayList<String>();
        long nextOccurrenceId = 1;
        for (int index = 0; index < operations.size(); index++) {
            Operation operation = operations.get(index);
            Value affected = null;
            String outcome;
            if ("PUSH".equals(operation.kind())) {
                affected = new Value(nextOccurrenceId++, operation.value());
                stack.add(affected);
                outcome = affected.value();
            } else if (stack.isEmpty()) {
                outcome = "EMPTY";
            } else if ("POP".equals(operation.kind())) {
                affected = stack.removeLast();
                outcome = affected.value();
            } else {
                affected = stack.getLast();
                outcome = affected.value();
            }
            outcomes.add(outcome);
            events.add(event(index + 1, index, stack, operation, affected, outcome,
                    affected == null && !"PUSH".equals(operation.kind())));
        }
        return new Trace(new Result("DATA_STRUCTURES", values(stack), occurrenceIds(stack), outcomes), events);
    }

    private static Event event(int sequence, int index, List<Value> stack, Operation operation, Value affected,
            String outcome, boolean emptyStructure) {
        String type = emptyStructure ? "EMPTY_STRUCTURE" : operation.kind();
        String line = switch (type) {
            case "PUSH" -> "stack-push";
            case "POP" -> "stack-pop";
            case "PEEK" -> "stack-peek";
            default -> "stack-empty";
        };
        return new Event(sequence, type, line, new State("DATA_STRUCTURES", values(stack), occurrenceIds(stack), index),
                new EventData(type, operation.kind(), affected == null ? null : affected.value(),
                        affected == null ? null : affected.occurrenceId(), outcome));
    }

    private static List<String> values(List<Value> stack) { return stack.stream().map(Value::value).toList(); }
    private static List<Long> occurrenceIds(List<Value> stack) { return stack.stream().map(Value::occurrenceId).toList(); }
}
