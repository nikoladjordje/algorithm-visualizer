package com.nikola.algorithmvisualizer.datastructures;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class DoublyLinkedListAlgorithmTests {
    @Test
    void tracesConstantTimeEndpointAdditionsWithBidirectionalTopology() {
        var trace = new DoublyLinkedListAlgorithm().execute(List.of(
                new DoublyLinkedListAlgorithm.Operation("PREPEND", "A"),
                new DoublyLinkedListAlgorithm.Operation("APPEND", "B"),
                new DoublyLinkedListAlgorithm.Operation("PREPEND", "A")));

        assertEquals(List.of("NODE_ALLOCATED", "ENDPOINTS_ESTABLISHED", "NODE_ALLOCATED", "PREV_ASSIGNED",
                "NEXT_ASSIGNED", "TAIL_MOVED", "NODE_ALLOCATED", "NEXT_ASSIGNED", "PREV_ASSIGNED", "HEAD_MOVED"),
                trace.events().stream().map(DoublyLinkedListAlgorithm.Event::type).toList());
        assertEquals(List.of(3L, 1L, 2L), trace.result().nodes().stream().map(DoublyLinkedListAlgorithm.Node::occurrenceId).toList());
        assertEquals(3L, trace.result().headOccurrenceId());
        assertEquals(2L, trace.result().tailOccurrenceId());
        assertEquals(1L, trace.result().nodes().get(0).nextOccurrenceId());
        assertEquals(null, trace.result().nodes().get(0).prevOccurrenceId());
        assertEquals(3L, trace.result().nodes().get(1).prevOccurrenceId());
        assertEquals(2L, trace.result().nodes().get(1).nextOccurrenceId());
        assertEquals(1L, trace.result().nodes().get(2).prevOccurrenceId());
        assertEquals(null, trace.result().nodes().get(2).nextOccurrenceId());
        assertEquals(List.of(1, 2, 3), trace.events().stream().map(DoublyLinkedListAlgorithm.Event::sequence).toList().subList(0, 3));
    }
}
