package com.nikola.algorithmvisualizer.trace;

import java.util.List;

import com.nikola.algorithmvisualizer.algorithm.ComparisonResult;

public record CompareData(List<Integer> indices, List<TraceItem> items, ComparisonResult result)
        implements EventData {
    public CompareData {
        indices = List.copyOf(indices);
        items = List.copyOf(items);
    }
}
