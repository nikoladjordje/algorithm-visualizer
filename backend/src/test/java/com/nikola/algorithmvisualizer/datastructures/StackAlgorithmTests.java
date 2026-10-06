package com.nikola.algorithmvisualizer.datastructures;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class StackAlgorithmTests {
    @Test
    void tracesPushPopPeekAndEmptyOutcomesWithoutCollapsingDuplicateOccurrences() {
        var trace = new StackAlgorithm().execute(List.of(
                new StackAlgorithm.Operation("PUSH", "A"),
                new StackAlgorithm.Operation("PUSH", "A"),
                new StackAlgorithm.Operation("PEEK", null),
                new StackAlgorithm.Operation("POP", null),
                new StackAlgorithm.Operation("POP", null),
                new StackAlgorithm.Operation("POP", null),
                new StackAlgorithm.Operation("PUSH", "B")));

        assertEquals(List.of("A", "A", "A", "A", "A", "EMPTY", "B"), trace.result().outcomes());
        assertEquals(List.of("B"), trace.result().values());
        assertEquals(List.of(3L), trace.result().occurrenceIds());
        assertEquals("EMPTY", trace.events().get(5).data().outcome());
        assertEquals(List.of("B"), trace.events().getLast().state().values());
        assertEquals(List.of(3L), trace.events().getLast().state().occurrenceIds());
    }

    @Test
    void treatsEmptyAsAValidStructureValueRatherThanAnEmptyOutcome() {
        var trace = new StackAlgorithm().execute(List.of(new StackAlgorithm.Operation("PUSH", "EMPTY")));

        assertEquals("PUSH", trace.events().getFirst().type());
        assertEquals("stack-push", trace.events().getFirst().pseudocodeLineId());
    }
}
