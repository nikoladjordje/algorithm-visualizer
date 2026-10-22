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
    @Test
    void removesBothEndpointsAndContinuesAfterEmptyRemoval() {
        var trace = new DoublyLinkedListAlgorithm().execute(List.of(
                new DoublyLinkedListAlgorithm.Operation("REMOVE_FIRST", null),
                new DoublyLinkedListAlgorithm.Operation("APPEND", "A"),
                new DoublyLinkedListAlgorithm.Operation("APPEND", "A"),
                new DoublyLinkedListAlgorithm.Operation("REMOVE_FIRST", null),
                new DoublyLinkedListAlgorithm.Operation("REMOVE_LAST", null),
                new DoublyLinkedListAlgorithm.Operation("REMOVE_LAST", null),
                new DoublyLinkedListAlgorithm.Operation("PREPEND", "B")));
        assertEquals(List.of("EMPTY_REMOVAL", "NODE_ALLOCATED", "ENDPOINTS_ESTABLISHED", "NODE_ALLOCATED", "PREV_ASSIGNED", "NEXT_ASSIGNED", "TAIL_MOVED", "ENDPOINT_SELECTED", "HEAD_MOVED", "PREV_CLEARED", "NODE_DETACHED", "REMOVAL_COMPLETED", "ENDPOINT_SELECTED", "TAIL_MOVED", "NODE_DETACHED", "REMOVAL_COMPLETED", "EMPTY_REMOVAL", "NODE_ALLOCATED", "ENDPOINTS_ESTABLISHED"), trace.events().stream().map(DoublyLinkedListAlgorithm.Event::type).toList());
        assertEquals(2L, trace.events().get(9).state().headOccurrenceId());
        assertEquals(null, trace.events().get(9).state().nodes().get(1).prevOccurrenceId());
        assertEquals(null, trace.events().get(10).state().nodes().get(0).nextOccurrenceId());
        assertEquals(0, trace.events().get(15).state().nodes().size());
        assertEquals(null, trace.events().get(15).state().headOccurrenceId());
        assertEquals(null, trace.events().get(15).state().tailOccurrenceId());
        assertEquals(3L, trace.result().headOccurrenceId());
        assertEquals(List.of("Nothing to remove: the list is empty", "A", "A", "Removed A from node 1", "Removed A from node 2", "Nothing to remove: the list is empty", "B"), trace.result().outcomes());
    }

    @Test
    void removingLastClearsThePreviousNodesNextLink() {
        var trace = new DoublyLinkedListAlgorithm().execute(List.of(
                new DoublyLinkedListAlgorithm.Operation("APPEND", "A"),
                new DoublyLinkedListAlgorithm.Operation("APPEND", "B"),
                new DoublyLinkedListAlgorithm.Operation("REMOVE_LAST", null)));
        assertEquals(List.of("ENDPOINT_SELECTED", "TAIL_MOVED", "NEXT_CLEARED", "NODE_DETACHED", "REMOVAL_COMPLETED"), trace.events().subList(6, 11).stream().map(DoublyLinkedListAlgorithm.Event::type).toList());
        assertEquals(null, trace.result().nodes().get(0).nextOccurrenceId());
        assertEquals(1L, trace.result().tailOccurrenceId());
        assertEquals(2L, trace.events().get(5).state().tailOccurrenceId());
    }
}
