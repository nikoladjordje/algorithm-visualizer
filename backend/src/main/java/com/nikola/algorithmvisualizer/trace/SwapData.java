package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record SwapData(List<Integer> indices) implements EventData {
    public SwapData {
        indices = List.copyOf(indices);
    }
}
