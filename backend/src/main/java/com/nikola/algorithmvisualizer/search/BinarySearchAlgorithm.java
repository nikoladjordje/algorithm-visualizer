package com.nikola.algorithmvisualizer.search;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/** Produces an immutable trace for binary search over a non-decreasing sequence. */
@Component
public class BinarySearchAlgorithm {
    public record State(String kind, List<Integer> values, int target, int lowerBound, int upperBound,
                        Integer selectedIndex, List<Integer> inspectedIndices) {
        public State { values = List.copyOf(values); inspectedIndices = List.copyOf(inspectedIndices); }
    }
    public record Data(String kind, Integer index, Integer value, String relation, Integer lowerBound,
                       Integer upperBound, Boolean found) { }
    public record Event(int sequence, String type, String pseudocodeLineId, State state, Data data) { }
    public record Result(String kind, boolean found, Integer foundIndex, int comparisons) { }
    public record Trace(Result result, List<Event> events) { public Trace { events = List.copyOf(events); } }

    public Trace execute(List<Integer> values, int target) {
        var events = new ArrayList<Event>();
        var inspected = new ArrayList<Integer>();
        int lower = 0, upper = values.size() - 1;
        add(events, "SEARCH_INITIALIZED", "binary-initialize", values, target, lower, upper, null, inspected,
                null, null, null, null);
        while (lower <= upper) {
            int middle = lower + (upper - lower) / 2;
            int value = values.get(middle);
            add(events, "CANDIDATE_SELECTED", "binary-select-middle", values, target, lower, upper, middle,
                    inspected, middle, value, null, null);
            inspected.add(middle);
            String relation = value == target ? "EQUAL" : value < target ? "LESS" : "GREATER";
            add(events, "TARGET_COMPARED", "binary-compare", values, target, lower, upper, middle, inspected,
                    middle, value, relation, value == target);
            if (value == target) {
                add(events, "SEARCH_FOUND", "binary-found", values, target, lower, upper, middle, inspected,
                        middle, value, relation, true);
                return new Trace(new Result("SEARCH", true, middle, inspected.size()), events);
            }
            if (value < target) lower = middle + 1; else upper = middle - 1;
            add(events, "SEARCH_INTERVAL_NARROWED", "binary-narrow-interval", values, target, lower, upper,
                    null, inspected, null, null, relation, null);
        }
        add(events, "SEARCH_NOT_FOUND", "binary-not-found", values, target, lower, upper, null, inspected,
                null, null, null, false);
        return new Trace(new Result("SEARCH", false, null, inspected.size()), events);
    }

    private static void add(List<Event> events, String type, String line, List<Integer> values, int target,
                            int lower, int upper, Integer selected, List<Integer> inspected, Integer index,
                            Integer value, String relation, Boolean found) {
        events.add(new Event(events.size() + 1, type, line,
                new State("SEARCH", values, target, lower, upper, selected, inspected),
                new Data(type, index, value, relation, lower, upper, found)));
    }
}
