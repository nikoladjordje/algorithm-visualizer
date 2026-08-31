package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record ReadData(List<Integer> indices, List<TraceItem> items) implements EventData {
    public ReadData {
        indices = List.copyOf(indices);
        items = List.copyOf(items);
    }
}
