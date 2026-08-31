package com.nikola.algorithmvisualizer.algorithm;

import java.util.List;

public record AlgorithmTrace(
        String algorithm,
        List<Integer> initialValues,
        List<Integer> sortedValues,
        List<AlgorithmEvent> events,
        int comparisons,
        int swaps
) {
    public AlgorithmTrace {
        initialValues = List.copyOf(initialValues);
        sortedValues = List.copyOf(sortedValues);
        events = List.copyOf(events);
    }
}
