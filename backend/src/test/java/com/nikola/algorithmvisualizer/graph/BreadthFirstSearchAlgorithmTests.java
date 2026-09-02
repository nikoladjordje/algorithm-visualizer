package com.nikola.algorithmvisualizer.graph;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class BreadthFirstSearchAlgorithmTests {
    @Test
    void producesCanonicalSingleNodeLifecycleAndMetrics() {
        var trace = new BreadthFirstSearchAlgorithm().execute(List.of("A"), "A");

        assertThat(trace.events()).extracting(event -> event.sequence()).containsExactly(1, 2, 3, 4);
        assertThat(trace.events()).extracting(event -> event.type()).containsExactly(
                BreadthFirstSearchAlgorithm.EventType.TRAVERSAL_INITIALIZED,
                BreadthFirstSearchAlgorithm.EventType.NODE_DEQUEUED,
                BreadthFirstSearchAlgorithm.EventType.NODE_COMPLETED,
                BreadthFirstSearchAlgorithm.EventType.TRAVERSAL_COMPLETED);
        assertThat(trace.events()).extracting(event -> event.state().nodeStatuses().get("A"))
                .containsExactly(BreadthFirstSearchAlgorithm.NodeStatus.DISCOVERED,
                        BreadthFirstSearchAlgorithm.NodeStatus.ACTIVE,
                        BreadthFirstSearchAlgorithm.NodeStatus.PROCESSED,
                        BreadthFirstSearchAlgorithm.NodeStatus.PROCESSED);
        assertThat(trace.result().traversalOrder()).containsExactly("A");
        assertThat(trace.result().parents()).isEmpty();
        assertThat(trace.result().unreachableNodes()).isEmpty();
        assertThat(trace.result().visitedNodeCount()).isEqualTo(1);
        assertThat(trace.result().edgeExaminationCount()).isZero();
        assertThat(trace.result().maximumQueueSize()).isEqualTo(1);
    }
}
