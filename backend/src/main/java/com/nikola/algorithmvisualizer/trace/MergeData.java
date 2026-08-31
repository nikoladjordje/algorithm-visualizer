package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record MergeData(int left, int middle, int right, List<TraceItem> buffer) implements EventData {
    public MergeData { buffer = List.copyOf(buffer); }
}
