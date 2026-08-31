package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record WriteData(List<Integer> indices, List<TraceItem> items) implements EventData {
    public WriteData {
        indices = List.copyOf(indices);
        items = List.copyOf(items);
    }
}
