package com.nikola.algorithmvisualizer.dynamicprogramming;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class KnapsackAlgorithmTests {
    @Test
    void emitsBaseCaseEvaluationAndCommitForOneFittingItem() {
        var trace = new KnapsackAlgorithm().execute(List.of(new KnapsackAlgorithm.Item("Map", 1, 4)), 1);

        assertIterableEquals(List.of("BASE_CASES_INITIALIZED", "CELL_EVALUATED", "CELL_COMMITTED"),
                trace.events().stream().map(KnapsackAlgorithm.Event::type).toList());
        assertEquals(List.of(List.of(0, 0), List.of(0, 4)), trace.events().get(2).state().table());
        assertEquals(4, trace.events().get(2).data().committedValue());
        assertEquals(3, trace.events().get(2).sequence());
    }

    @Test
    void evaluatesEveryNonBaseCellInRowMajorOrder() {
        var trace = new KnapsackAlgorithm().execute(List.of(
                new KnapsackAlgorithm.Item("Map", 1, 4),
                new KnapsackAlgorithm.Item("Compass", 2, 5)), 3);

        assertIterableEquals(List.of(
                "BASE_CASES_INITIALIZED",
                "CELL_EVALUATED", "CELL_COMMITTED",
                "CELL_EVALUATED", "CELL_COMMITTED",
                "CELL_EVALUATED", "CELL_COMMITTED",
                "CELL_EVALUATED", "CELL_COMMITTED",
                "CELL_EVALUATED", "CELL_COMMITTED",
                "CELL_EVALUATED", "CELL_COMMITTED"),
                trace.events().stream().map(KnapsackAlgorithm.Event::type).toList());
        assertEquals(List.of(List.of(0, 0, 0, 0), List.of(0, 4, 4, 4), List.of(0, 4, 5, 9)),
                trace.events().getLast().state().table());
        assertEquals(9, trace.result().maximumValue());
    }

    @Test
    void excludesIneligibleItemsAndEqualValueTiesWithoutMutatingEarlierSnapshots() {
        var trace = new KnapsackAlgorithm().execute(List.of(
                new KnapsackAlgorithm.Item("Map", 1, 4),
                new KnapsackAlgorithm.Item("Tent", 2, 4),
                new KnapsackAlgorithm.Item("Guide", 1, 4)), 1);

        var evaluatedTent = trace.events().get(3);
        assertEquals(null, evaluatedTent.data().includeValue());
        assertEquals("EXCLUDE", evaluatedTent.data().selectedBranch());
        assertEquals("Item weight exceeds this capacity", evaluatedTent.data().unavailableCandidateReason());
        assertEquals(List.of(List.of(0, 0), List.of(0, 4), List.of(0, 0), List.of(0, 0)),
                evaluatedTent.state().table());
        assertEquals("EXCLUDE", trace.events().get(5).data().selectedBranch());
    }
}
