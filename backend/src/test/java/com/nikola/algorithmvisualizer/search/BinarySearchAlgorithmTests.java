package com.nikola.algorithmvisualizer.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

class BinarySearchAlgorithmTests {
    private final BinarySearchAlgorithm algorithm = new BinarySearchAlgorithm();

    @Test
    void narrowsBothDirectionsAndFindsTheFirstEqualityProbed() {
        var trace = algorithm.execute(List.of(1, 3, 5, 5, 5, 9, 12), 5);

        assertEquals(3, trace.result().foundIndex());
        assertEquals(1, trace.result().comparisons());
        assertEquals(List.of("SEARCH_INITIALIZED", "CANDIDATE_SELECTED", "TARGET_COMPARED", "SEARCH_FOUND"),
                trace.events().stream().map(BinarySearchAlgorithm.Event::type).toList());

        var rightTrace = algorithm.execute(List.of(1, 3, 5, 7), 7);
        assertEquals(List.of(2, 3), rightTrace.events().stream()
                .filter(event -> event.type().equals("SEARCH_INTERVAL_NARROWED"))
                .map(event -> event.state().lowerBound()).toList());
        assertEquals(3, rightTrace.result().foundIndex());
    }

    @Test
    void completesEmptyAndExhaustedIntervalsNormally() {
        var empty = algorithm.execute(List.of(), 4);
        var missed = algorithm.execute(List.of(1, 3, 5), 4);

        assertEquals(0, empty.result().comparisons());
        assertEquals(-1, empty.events().getLast().state().upperBound());
        assertEquals("SEARCH_NOT_FOUND", missed.events().getLast().type());
        assertEquals(2, missed.result().comparisons());
        assertEquals(List.of(1, 2), missed.events().getLast().state().inspectedIndices());
    }

    @Test
    void snapshotsAreImmutable() {
        var trace = algorithm.execute(List.of(1, 2), 2);
        assertThrows(UnsupportedOperationException.class,
                () -> trace.events().getFirst().state().values().add(3));
    }
}
