package com.nikola.algorithmvisualizer.trace;

public enum SemanticEventType {
    SELECT,
    READ,
    COMPARE,
    SWAP,
    WRITE,
    MARK_SORTED,
    PASS_START,
    PASS_COMPLETE,
    NO_SWAP_COMPLETE,
    MINIMUM_UPDATE,
    SPLIT_RANGE,
    BEGIN_MERGE,
    BUFFER_MOVE,
    COMPLETE_MERGE,
    PIVOT_SELECT,
    PARTITION_ACTIVE,
    PARTITION_COMPLETE,
    BUILD_HEAP,
    ROOT_SELECT,
    HEAPIFY,
    HEAP_SHRINK
}
