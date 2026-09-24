package com.nikola.algorithmvisualizer.search;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/** Produces the learner-facing, immutable trace for a left-to-right linear search. */
@Component
public class LinearSearchAlgorithm {
    public record State(String kind, List<Integer> values, int target, Integer selectedIndex,
                        List<Integer> inspectedIndices) { public State { values = List.copyOf(values); inspectedIndices = List.copyOf(inspectedIndices); } }
    public record Data(String kind, Integer index, Integer value, Boolean found) { }
    public record Event(int sequence, String type, String pseudocodeLineId, State state, Data data) { }
    public record Result(String kind, boolean found, Integer foundIndex, int comparisons) { }
    public record Trace(Result result, List<Event> events) { public Trace { events = List.copyOf(events); } }

    public Trace execute(List<Integer> values, int target) {
        var events = new ArrayList<Event>(); var inspected = new ArrayList<Integer>();
        add(events, "SEARCH_INITIALIZED", "linear-initialize", values, target, null, inspected, null, null, null);
        for (int index = 0; index < values.size(); index++) {
            int value = values.get(index);
            add(events, "CANDIDATE_SELECTED", "linear-select", values, target, index, inspected, index, value, null);
            inspected.add(index); boolean found = value == target;
            add(events, "TARGET_COMPARED", "linear-compare", values, target, index, inspected, index, value, found);
            if (found) { add(events, "SEARCH_FOUND", "linear-found", values, target, index, inspected, index, value, true); return new Trace(new Result("SEARCH", true, index, inspected.size()), events); }
        }
        add(events, "SEARCH_NOT_FOUND", "linear-not-found", values, target, null, inspected, null, null, false);
        return new Trace(new Result("SEARCH", false, null, inspected.size()), events);
    }
    private static void add(List<Event> events, String type, String line, List<Integer> values, int target, Integer selected, List<Integer> inspected, Integer index, Integer value, Boolean found) {
        events.add(new Event(events.size() + 1, type, line, new State("SEARCH", values, target, selected, inspected), new Data(type, index, value, found)));
    }
}
