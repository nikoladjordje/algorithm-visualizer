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

    @Test
    void tracesAppendAllocationTraversalAndFinalLinkInOrder() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("PREPEND", "A"),
                new LinkedListAlgorithm.Operation("PREPEND", "B"),
                new LinkedListAlgorithm.Operation("APPEND", "C")));

        assertEquals(List.of("NODE_ALLOCATED", "NEXT_INITIALIZED", "HEAD_MOVED", "NODE_ALLOCATED",
                "NEXT_INITIALIZED", "HEAD_MOVED", "NODE_ALLOCATED", "NODE_INSPECTED", "NODE_INSPECTED",
                "FINAL_LINK_CREATED"), trace.events().stream().map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(List.of(2L, 1L), trace.events().subList(7, 9).stream()
                .map(event -> event.data().occurrenceId()).toList());
        assertEquals(3L, trace.events().getLast().state().nodes().get(0).nextOccurrenceId());
        assertEquals(2L, trace.result().headOccurrenceId());
    }

    @Test
    void establishesHeadWhenAppendingToAnEmptyListWithoutTraversal() {
        var trace = new LinkedListAlgorithm().execute(List.of(new LinkedListAlgorithm.Operation("APPEND", "A")));

        assertEquals(List.of("NODE_ALLOCATED", "HEAD_MOVED"),
                trace.events().stream().map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(1L, trace.result().headOccurrenceId());
    }

    @Test
    void preservesDistinctOccurrenceIdentityWhenAppendingADuplicateLabel() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("PREPEND", "A"),
                new LinkedListAlgorithm.Operation("APPEND", "A")));

        assertEquals(List.of(1L, 2L), trace.result().nodes().stream()
                .map(LinkedListAlgorithm.Node::occurrenceId).toList());
        assertEquals(2L, trace.result().nodes().getFirst().nextOccurrenceId());
        assertEquals(1L, trace.events().get(4).data().occurrenceId());
    }

    @Test
    void findsOnlyTheFirstMatchingLiveOccurrenceWithoutChangingTopology() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("PREPEND", "A"),
                new LinkedListAlgorithm.Operation("APPEND", "B"),
                new LinkedListAlgorithm.Operation("APPEND", "A"),
                new LinkedListAlgorithm.Operation("FIND", "A")));

        assertEquals(List.of("NODE_INSPECTED", "NODE_MATCHED"), trace.events().subList(10, 12).stream()
                .map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(1L, trace.events().get(11).data().occurrenceId());
        assertEquals(List.of(1L, 2L, 3L), trace.events().getLast().state().nodes().stream()
                .map(LinkedListAlgorithm.Node::occurrenceId).toList());
        assertEquals(List.of("A", "B", "A", "Found A at node 1"), trace.result().outcomes());
    }

    @Test
    void completesAnEmptyOrAbsentFindAsANotFoundOutcome() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("FIND", "A"),
                new LinkedListAlgorithm.Operation("PREPEND", "B"),
                new LinkedListAlgorithm.Operation("FIND", "A")));

        assertEquals(List.of("SEARCH_NOT_FOUND", "NODE_ALLOCATED", "NEXT_INITIALIZED", "HEAD_MOVED",
                "NODE_INSPECTED", "SEARCH_NOT_FOUND"), trace.events().stream()
                .map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(List.of("Not found: A", "B", "Not found: A"), trace.result().outcomes());
        assertEquals(1L, trace.result().headOccurrenceId());
    }

    @Test
    void tracesHeadSelectionMovementDetachmentAndRemovalWithoutLosingSuccessorIdentity() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("PREPEND", "A"),
                new LinkedListAlgorithm.Operation("APPEND", "B"),
                new LinkedListAlgorithm.Operation("REMOVE_FIRST", null)));

        assertEquals(List.of("HEAD_SELECTED", "HEAD_MOVED", "NODE_DETACHED", "NODE_REMOVED"),
                trace.events().subList(6, 10).stream().map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(1L, trace.events().get(6).state().headOccurrenceId());
        assertEquals(2L, trace.events().get(7).state().headOccurrenceId());
        assertEquals(2L, trace.events().get(7).data().occurrenceId());
        assertEquals(1L, trace.events().get(8).state().detachedOccurrenceId());
        assertEquals(null, trace.events().get(8).state().nodes().getFirst().nextOccurrenceId());
        assertEquals(List.of(2L), trace.events().get(9).state().nodes().stream()
                .map(LinkedListAlgorithm.Node::occurrenceId).toList());
        assertEquals(List.of("A", "B", "Removed A from node 1"), trace.result().outcomes());
    }

    @Test
    void makesEmptyRemovalAVisibleNoOpAndContinuesTheSequence() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("REMOVE_FIRST", null),
                new LinkedListAlgorithm.Operation("PREPEND", "B")));

        assertEquals(List.of("EMPTY_STRUCTURE", "NODE_ALLOCATED", "NEXT_INITIALIZED", "HEAD_MOVED"),
                trace.events().stream().map(LinkedListAlgorithm.Event::type).toList());
        assertEquals(List.of("Nothing to remove: the list is empty", "B"), trace.result().outcomes());
        assertEquals(1L, trace.result().headOccurrenceId());
    }

    @Test
    void preservesTheSecondDuplicateWhenRemovingTheFirstDuplicate() {
        var trace = new LinkedListAlgorithm().execute(List.of(
                new LinkedListAlgorithm.Operation("PREPEND", "A"),
                new LinkedListAlgorithm.Operation("APPEND", "A"),
                new LinkedListAlgorithm.Operation("REMOVE_FIRST", null)));

        assertEquals(1L, trace.events().get(8).state().detachedOccurrenceId());
        assertEquals(List.of(2L), trace.result().nodes().stream().map(LinkedListAlgorithm.Node::occurrenceId).toList());
        assertEquals("A", trace.result().nodes().getFirst().value());
    }
}
