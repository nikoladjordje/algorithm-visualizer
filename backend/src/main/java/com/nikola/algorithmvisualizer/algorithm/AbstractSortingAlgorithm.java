package com.nikola.algorithmvisualizer.algorithm;

import java.util.ArrayList;
import java.util.List;
import com.nikola.algorithmvisualizer.trace.*;

abstract class AbstractSortingAlgorithm implements SortingAlgorithm<EventData> {
    static final int MAX_INPUT_ITEMS = 50;
    static final int MAX_EVENTS = 10_000;
    List<TraceItem> items(List<Integer> input) {
        List<TraceItem> result = new ArrayList<>();
        for (int index = 0; index < input.size(); index++) result.add(new TraceItem(index, input.get(index)));
        return result;
    }
    ComparisonResult compare(TraceItem left, TraceItem right) {
        return left.value() < right.value() ? ComparisonResult.LESS
                : left.value() > right.value() ? ComparisonResult.GREATER : ComparisonResult.EQUAL;
    }
    List<Integer> values(List<TraceItem> items) { return items.stream().map(TraceItem::value).toList(); }
    List<SortedRange> ranges(SortedRange... ranges) { return List.of(ranges); }
    VersionedAlgorithmTrace<EventData> result(List<Integer> input, List<TraceItem> items, TraceEventBuilder trace) {
        return new VersionedAlgorithmTrace<>("1.0", info(), List.copyOf(input),
                new TraceSummary(values(items), trace.events().size(), trace.counts()),
                new TraceLimits(MAX_INPUT_ITEMS, MAX_EVENTS), trace.events());
    }
}
