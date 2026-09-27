package com.nikola.algorithmvisualizer.dynamicprogramming;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class KnapsackAlgorithm {
    public record Item(String name, int weight, int value) { }

    public record Cell(int itemCount, int capacity) { }

    public record State(String kind, List<Item> items, int capacity, List<List<Integer>> table,
            int activeItemCount, int activeCapacity, List<Cell> dependencyCells, String phase) {
        public State {
            items = List.copyOf(items);
            table = table.stream().map(List::copyOf).toList();
            dependencyCells = List.copyOf(dependencyCells);
        }
    }

    public record EventData(String kind, Integer excludeValue, Integer includeValue,
            Integer committedValue, String selectedBranch, String unavailableCandidateReason) { }

    public record Event(int sequence, String type, String pseudocodeLineId, State state,
            EventData data) { }

    public record Result(String kind, int maximumValue) { }

    public record Trace(Result result, List<Event> events) {
        public Trace { events = List.copyOf(events); }
    }

    public Trace execute(List<Item> items, int capacity) {
        List<List<Integer>> table = createTable(items.size(), capacity);
        List<Event> events = new ArrayList<>();
        events.add(event(1, "BASE_CASES_INITIALIZED", "knapsack-initialize-base-cases", items, capacity,
                table, 0, 0, List.of(), "BASE_CASES",
                new EventData("BASE_CASES_INITIALIZED", null, null, null, null, null)));

        int sequence = 2;
        for (int itemCount = 1; itemCount <= items.size(); itemCount++) {
            Item item = items.get(itemCount - 1);
            for (int currentCapacity = 1; currentCapacity <= capacity; currentCapacity++) {
                int excludeValue = table.get(itemCount - 1).get(currentCapacity);
                boolean fits = item.weight() <= currentCapacity;
                Integer includeValue = fits
                        ? item.value() + table.get(itemCount - 1).get(currentCapacity - item.weight())
                        : null;
                List<Cell> dependencies = fits
                        ? List.of(new Cell(itemCount - 1, currentCapacity),
                                new Cell(itemCount - 1, currentCapacity - item.weight()))
                        : List.of(new Cell(itemCount - 1, currentCapacity));
                String branch = fits && includeValue > excludeValue ? "INCLUDE" : "EXCLUDE";
                String unavailableReason = fits ? null : "Item weight exceeds this capacity";
                events.add(event(sequence++, "CELL_EVALUATED", "knapsack-evaluate-cell", items, capacity,
                        table, itemCount, currentCapacity, dependencies, "TABULATION",
                        new EventData("CELL_EVALUATED", excludeValue, includeValue, null, branch,
                                unavailableReason)));

                int committedValue = "INCLUDE".equals(branch) ? includeValue : excludeValue;
                table.get(itemCount).set(currentCapacity, committedValue);
                events.add(event(sequence++, "CELL_COMMITTED", "knapsack-commit-cell", items, capacity,
                        table, itemCount, currentCapacity, dependencies, "TABULATION",
                        new EventData("CELL_COMMITTED", excludeValue, includeValue, committedValue, branch,
                                unavailableReason)));
            }
        }
        return new Trace(new Result("DYNAMIC_PROGRAMMING", table.getLast().get(capacity)), events);
    }

    private static List<List<Integer>> createTable(int itemCount, int capacity) {
        List<List<Integer>> table = new ArrayList<>();
        for (int row = 0; row <= itemCount; row++) {
            List<Integer> values = new ArrayList<>();
            for (int column = 0; column <= capacity; column++) values.add(0);
            table.add(values);
        }
        return table;
    }

    private static Event event(int sequence, String type, String pseudocodeLineId, List<Item> items,
            int capacity, List<List<Integer>> table, int activeItemCount, int activeCapacity,
            List<Cell> dependencyCells, String phase, EventData data) {
        return new Event(sequence, type, pseudocodeLineId,
                new State("DYNAMIC_PROGRAMMING", items, capacity, table, activeItemCount, activeCapacity,
                        dependencyCells, phase), data);
    }
}
