package com.nikola.algorithmvisualizer.algorithm;

import java.util.List;

public record AlgorithmEvent(
        AlgorithmEventType type,
        List<Integer> indices,
        List<Integer> values,
        String description,
        String pseudocodeLineId,
        Integer sortedThrough,
        ComparisonResult comparisonResult,
        int pass
) {
    public AlgorithmEvent {
        indices = List.copyOf(indices);
        values = List.copyOf(values);
    }
}
