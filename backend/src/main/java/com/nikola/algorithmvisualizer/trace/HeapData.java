package com.nikola.algorithmvisualizer.trace;

public record HeapData(int heapSize, int rootIndex, int childIndex) implements EventData {
}
