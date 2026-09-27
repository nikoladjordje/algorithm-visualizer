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
}
