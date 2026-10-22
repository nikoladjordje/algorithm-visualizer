package com.nikola.algorithmvisualizer.datastructures;

import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.List;
import org.junit.jupiter.api.Test;

class DequeAlgorithmTests {
    @Test
    void readsBothEndsWithoutChangingDuplicateOccurrencesAndContinuesAfterEmptyReads() {
        var trace = new DequeAlgorithm().execute(List.of(
                new DequeAlgorithm.Operation("PEEK_FIRST", null),
                new DequeAlgorithm.Operation("ADD_FIRST", "A"),
                new DequeAlgorithm.Operation("ADD_LAST", "A"),
                new DequeAlgorithm.Operation("PEEK_FIRST", null),
                new DequeAlgorithm.Operation("PEEK_LAST", null)));
        assertEquals(List.of("Nothing to read: the deque is empty", "Added A at front (node 1)", "Added A at rear (node 2)", "Front: A (node 1)", "Rear: A (node 2)"), trace.result().outcomes());
        assertEquals(1L, trace.result().frontOccurrenceId());
        assertEquals(2L, trace.result().rearOccurrenceId());
        var before = trace.events().get(trace.events().size() - 3).state().nodes();
        assertEquals(before, trace.events().getLast().state().nodes());
        assertEquals(1L, trace.events().get(trace.events().size() - 2).data().occurrenceId());
        assertEquals(2L, trace.events().getLast().data().occurrenceId());
    }
    @Test
    void preservesEveryEndpointAndLinkDuringReadsInEmptySingleAndMultipleNodeStates() {
        var trace = new DequeAlgorithm().execute(List.of(
                new DequeAlgorithm.Operation("PEEK_LAST", null),
                new DequeAlgorithm.Operation("ADD_LAST", "A"),
                new DequeAlgorithm.Operation("PEEK_FIRST", null),
                new DequeAlgorithm.Operation("PEEK_LAST", null),
                new DequeAlgorithm.Operation("ADD_FIRST", "B"),
                new DequeAlgorithm.Operation("ADD_FIRST", "C"),
                new DequeAlgorithm.Operation("ADD_LAST", "D"),
                new DequeAlgorithm.Operation("PEEK_FIRST", null),
                new DequeAlgorithm.Operation("PEEK_LAST", null)));
        assertEquals("Nothing to read: the deque is empty", trace.result().outcomes().getFirst());
        assertEquals("Front: A (node 1)", trace.result().outcomes().get(2));
        assertEquals("Rear: A (node 1)", trace.result().outcomes().get(3));
        assertEquals("Front: C (node 3)", trace.result().outcomes().get(7));
        assertEquals("Rear: D (node 4)", trace.result().outcomes().get(8));
        var events = trace.events();
        var before = events.get(events.size() - 3).state();
        var first = events.get(events.size() - 2).state();
        var last = events.getLast().state();
        assertEquals(before.nodes(), first.nodes());
        assertEquals(before.nodes(), last.nodes());
        assertEquals(before.frontOccurrenceId(), last.frontOccurrenceId());
        assertEquals(before.rearOccurrenceId(), last.rearOccurrenceId());
        assertEquals(4, last.nodes().size());
        assertEquals(List.of(3L, 2L, 1L, 4L), trace.result().nodes().stream().map(DoublyLinkedListAlgorithm.Node::occurrenceId).toList());
    }
    @Test
    void removesBothEndsAndContinuesAfterEmptyRemoval() {
        var trace = new DequeAlgorithm().execute(List.of(
                new DequeAlgorithm.Operation("REMOVE_FIRST", null),
                new DequeAlgorithm.Operation("ADD_FIRST", "A"),
                new DequeAlgorithm.Operation("ADD_LAST", "A"),
                new DequeAlgorithm.Operation("REMOVE_LAST", null),
                new DequeAlgorithm.Operation("REMOVE_FIRST", null)));
        assertEquals("Nothing to remove: the deque is empty", trace.result().outcomes().getFirst());
        assertEquals(List.of("ENDPOINT_SELECTED", "TAIL_MOVED", "NEXT_CLEARED", "NODE_DETACHED", "REMOVAL_COMPLETED"),
                trace.events().stream().filter(e -> e.state().activeOperationIndex() == 3).map(DequeAlgorithm.Event::type).toList());
        assertEquals(0, trace.result().size());
        assertEquals(null, trace.result().frontOccurrenceId());
        assertEquals(null, trace.result().rearOccurrenceId());
    }
    @Test
    void removingFrontPreservesEarlierSnapshotsAndRewiresDuplicateNodes() {
        var trace = new DequeAlgorithm().execute(List.of(
                new DequeAlgorithm.Operation("ADD_LAST", "A"),
                new DequeAlgorithm.Operation("ADD_LAST", "A"),
                new DequeAlgorithm.Operation("REMOVE_FIRST", null),
                new DequeAlgorithm.Operation("REMOVE_LAST", null)));
        var removal = trace.events().stream().filter(e -> e.state().activeOperationIndex() == 2).toList();
        assertEquals(List.of("ENDPOINT_SELECTED", "HEAD_MOVED", "PREV_CLEARED", "NODE_DETACHED", "REMOVAL_COMPLETED"),
                removal.stream().map(DequeAlgorithm.Event::type).toList());
        assertEquals(1L, removal.getFirst().state().frontOccurrenceId());
        assertEquals(2L, removal.getFirst().state().rearOccurrenceId());
        assertEquals(1L, removal.getFirst().state().nodes().get(1).prevOccurrenceId());
        var committed = removal.getLast().state();
        assertEquals(2L, committed.frontOccurrenceId());
        assertEquals(2L, committed.rearOccurrenceId());
        assertEquals(null, committed.nodes().getFirst().prevOccurrenceId());
        assertEquals(null, committed.nodes().getFirst().nextOccurrenceId());
        assertEquals(0, trace.result().size());
    }
}
