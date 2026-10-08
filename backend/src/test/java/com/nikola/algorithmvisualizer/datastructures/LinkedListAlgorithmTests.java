package com.nikola.algorithmvisualizer.datastructures;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class LinkedListAlgorithmTests {
    @Test
    void tracesAllocationLinkInitializationAndHeadMovementForEachPrepend() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("PREPEND", "A"),
                new LinkedListAlgorithm.Operation("PREPEND", "A")));

        assertEquals(List.of("NODE_ALLOCATED", "NEXT_INITIALIZED", "HEAD_MOVED", "NODE_ALLOCATED",
                "NEXT_INITIALIZED", "HEAD_MOVED"), trace.events().stream().map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(1L, trace.events().get(0).state().allocatedOccurrenceId());
        assertEquals(null, trace.events().get(0).state().nodes().getFirst().nextOccurrenceId());
        assertEquals(null, trace.events().get(1).state().nodes().getFirst().nextOccurrenceId());
        assertEquals(2L, trace.events().getLast().state().headOccurrenceId());
        assertEquals(List.of(1L, 2L), trace.result().nodes().stream().map(LinkedListAlgorithm.Node::occurrenceId).toList());
        assertEquals(List.of("A", "A"), trace.result().outcomes());
    }
}
