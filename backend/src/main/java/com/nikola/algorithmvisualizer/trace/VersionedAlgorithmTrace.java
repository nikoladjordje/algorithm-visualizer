package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record VersionedAlgorithmTrace<D extends EventData>(
        String apiVersion,
        AlgorithmInfo algorithm,
        List<Integer> inputValues,
        TraceSummary summary,
        TraceLimits limits,
        List<SemanticEvent<D>> events
) {
    public VersionedAlgorithmTrace {
        inputValues = List.copyOf(inputValues);
        events = List.copyOf(events);
    }
}
