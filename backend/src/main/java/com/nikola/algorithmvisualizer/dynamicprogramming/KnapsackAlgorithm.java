package com.nikola.algorithmvisualizer.dynamicprogramming;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class KnapsackAlgorithm {
    public record Item(String name, int weight, int value) { }

    public record State(String kind, List<Item> items, int capacity, List<List<Integer>> table,
            int activeItemCount, int activeCapacity, String phase) {
        public State {
            items = List.copyOf(items);
            table = table.stream().map(List::copyOf).toList();
        }
    }

    public record EventData(String kind, Integer excludeValue, Integer includeValue,
            Integer committedValue) { }

    public record Event(int sequence, String type, String pseudocodeLineId, State state,
            EventData data) { }

    public record Result(String kind, int maximumValue) { }

    public record Trace(Result result, List<Event> events) {
        public Trace { events = List.copyOf(events); }
    }

    public Trace execute(List<Item> items, int capacity) {
        Item item = items.getFirst();
        List<List<Integer>> table = new ArrayList<>();
        table.add(new ArrayList<>(List.of(0, 0)));
        table.add(new ArrayList<>(List.of(0, 0)));
        List<Event> events = new ArrayList<>();
        events.add(event(1, "BASE_CASES_INITIALIZED", "knapsack-initialize-base-cases", items, capacity,
                table, 0, 0, "BASE_CASES", new EventData("BASE_CASES_INITIALIZED", null, null, null)));

        int excludeValue = table.get(0).get(1);
        int includeValue = item.weight() <= capacity ? item.value() + table.get(0).get(0) : 0;
        events.add(event(2, "CELL_EVALUATED", "knapsack-evaluate-cell", items, capacity, table, 1, 1,
                "TABULATION", new EventData("CELL_EVALUATED", excludeValue,
                        item.weight() <= capacity ? includeValue : null, null)));

        int committedValue = item.weight() <= capacity ? Math.max(excludeValue, includeValue) : excludeValue;
        table.get(1).set(1, committedValue);
        events.add(event(3, "CELL_COMMITTED", "knapsack-commit-cell", items, capacity, table, 1, 1,
                "TABULATION", new EventData("CELL_COMMITTED", excludeValue,
                        item.weight() <= capacity ? includeValue : null, committedValue)));
        return new Trace(new Result("DYNAMIC_PROGRAMMING", committedValue), events);
    }

    private static Event event(int sequence, String type, String pseudocodeLineId, List<Item> items,
            int capacity, List<List<Integer>> table, int activeItemCount, int activeCapacity,
            String phase, EventData data) {
        return new Event(sequence, type, pseudocodeLineId,
                new State("DYNAMIC_PROGRAMMING", items, capacity, table, activeItemCount, activeCapacity, phase), data);
    }
}
