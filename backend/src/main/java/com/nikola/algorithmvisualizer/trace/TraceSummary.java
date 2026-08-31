package com.nikola.algorithmvisualizer.trace;

import java.util.List;
import java.util.Map;

public record TraceSummary(
        List<Integer> resultValues,
        int eventCount,
        Map<String, Integer> operationCounts
) {
    public TraceSummary {
        resultValues = List.copyOf(resultValues);
        operationCounts = Map.copyOf(operationCounts);
    }
}
