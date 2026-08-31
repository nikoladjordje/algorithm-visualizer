package com.nikola.algorithmvisualizer.trace;

public sealed interface EventData permits SelectData, ReadData, CompareData, SwapData, WriteData,
        MarkSortedData, RangeData, PassData, MinimumData, MergeData, PartitionData, HeapData {
}
