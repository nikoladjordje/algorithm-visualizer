package com.nikola.algorithmvisualizer.datastructures;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class QueueAlgorithmTests {
    @Test
    void tracesEnqueueDequeuePeekAndEmptyOutcomesInFirstInFirstOutOrder() {
        var trace = new QueueAlgorithm().execute(List.of(
                new QueueAlgorithm.Operation("ENQUEUE", "A"),
                new QueueAlgorithm.Operation("ENQUEUE", "A"),
                new QueueAlgorithm.Operation("PEEK", null),
                new QueueAlgorithm.Operation("DEQUEUE", null),
                new QueueAlgorithm.Operation("DEQUEUE", null),
                new QueueAlgorithm.Operation("DEQUEUE", null),
                new QueueAlgorithm.Operation("ENQUEUE", "B")));

        assertEquals(List.of("A", "A", "A", "A", "A", "EMPTY", "B"), trace.result().outcomes());
        assertEquals(List.of("B"), trace.result().values());
        assertEquals(List.of(3L), trace.result().occurrenceIds());
        assertEquals("EMPTY", trace.events().get(5).data().outcome());
        assertEquals(List.of("B"), trace.events().getLast().state().values());
        assertEquals(List.of(3L), trace.events().getLast().state().occurrenceIds());
    }

    @Test
    void treatsEmptyAsAValidStructureValueRatherThanAnEmptyOutcome() {
        var trace = new QueueAlgorithm().execute(List.of(new QueueAlgorithm.Operation("ENQUEUE", "EMPTY")));

        assertEquals("ENQUEUE", trace.events().getFirst().type());
        assertEquals("queue-enqueue", trace.events().getFirst().pseudocodeLineId());
    }
}
