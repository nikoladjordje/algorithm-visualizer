package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record SemanticEvent<D extends EventData>(
        int sequence,
        SemanticEventType type,
        String pseudocodeLineId,
        List<TraceItem> state,
        List<SortedRange> sortedRanges,
        D data
) {
    public SemanticEvent {
        state = List.copyOf(state);
        sortedRanges = List.copyOf(sortedRanges);
    }
}
