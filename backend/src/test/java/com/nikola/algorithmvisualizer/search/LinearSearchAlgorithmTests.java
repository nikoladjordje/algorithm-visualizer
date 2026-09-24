package com.nikola.algorithmvisualizer.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

class LinearSearchAlgorithmTests {
    private final LinearSearchAlgorithm algorithm = new LinearSearchAlgorithm();

    @Test
    void returnsTheFirstLeftToRightMatchWithSeparateSelectionAndComparisonSteps() {
        var trace = algorithm.execute(List.of(-2, 7, -2), -2);

        assertEquals(0, trace.result().foundIndex());
        assertEquals(1, trace.result().comparisons());
        assertEquals(List.of("SEARCH_INITIALIZED", "CANDIDATE_SELECTED", "TARGET_COMPARED",
                "SEARCH_FOUND"), trace.events().stream().map(LinearSearchAlgorithm.Event::type).toList());
        assertEquals(List.of(1, 2, 3, 4), trace.events().stream()
                .map(LinearSearchAlgorithm.Event::sequence).toList());
    }

    @Test
    void completesAnEmptyOrExhaustedSequenceAsNotFound() {
        var emptyTrace = algorithm.execute(List.of(), 9);
        var missedTrace = algorithm.execute(List.of(1, 2), 9);

        assertEquals(0, emptyTrace.result().comparisons());
        assertEquals(List.of("SEARCH_INITIALIZED", "SEARCH_NOT_FOUND"), emptyTrace.events().stream()
                .map(LinearSearchAlgorithm.Event::type).toList());
        assertEquals(2, missedTrace.result().comparisons());
        assertEquals("SEARCH_NOT_FOUND", missedTrace.events().getLast().type());
        assertEquals(List.of(0, 1), missedTrace.events().getLast().state().inspectedIndices());
    }

    @Test
    void findsOneItemAndTheFinalCandidateWithoutMutatingTheSequence() {
        var oneItemTrace = algorithm.execute(List.of(Integer.MIN_VALUE), Integer.MIN_VALUE);
        var finalMatchTrace = algorithm.execute(List.of(Integer.MAX_VALUE, -1, 4), 4);

        assertEquals(0, oneItemTrace.result().foundIndex());
        assertEquals(2, finalMatchTrace.result().foundIndex());
        assertEquals(3, finalMatchTrace.result().comparisons());
        assertEquals(List.of(Integer.MAX_VALUE, -1, 4), finalMatchTrace.events().getLast()
                .state().values());
    }

    @Test
    void snapshotsAreImmutable() {
        var trace = algorithm.execute(List.of(1), 1);

        assertThrows(UnsupportedOperationException.class,
                () -> trace.events().getFirst().state().values().add(2));
        assertThrows(UnsupportedOperationException.class,
                () -> trace.events().getLast().state().inspectedIndices().add(2));
    }
}
