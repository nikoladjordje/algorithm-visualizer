package com.nikola.algorithmvisualizer.trace;

public record PartitionData(int left, int right, int scanner, int boundary, int pivotIndex) implements EventData {
}
