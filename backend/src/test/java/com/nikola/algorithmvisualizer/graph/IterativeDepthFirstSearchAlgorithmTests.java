package com.nikola.algorithmvisualizer.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class IterativeDepthFirstSearchAlgorithmTests {
    @Test
    void tracesSingleNodeLifecycleWithImmutableStackSnapshots() {
        var trace = new IterativeDepthFirstSearchAlgorithm().execute(List.of("A"), "A");

        assertThat(trace.events()).extracting(IterativeDepthFirstSearchAlgorithm.Event::sequence)
                .containsExactly(1, 2, 3, 4);
        assertThat(trace.events()).extracting(IterativeDepthFirstSearchAlgorithm.Event::type)
                .containsExactly(
                        IterativeDepthFirstSearchAlgorithm.EventType.TRAVERSAL_INITIALIZED,
                        IterativeDepthFirstSearchAlgorithm.EventType.NODE_POPPED,
                        IterativeDepthFirstSearchAlgorithm.EventType.NODE_COMPLETED,
                        IterativeDepthFirstSearchAlgorithm.EventType.TRAVERSAL_COMPLETED);
        assertThat(trace.events()).extracting(event -> event.state().nodeStatuses().get("A"))
                .containsExactly(
                        IterativeDepthFirstSearchAlgorithm.NodeStatus.DISCOVERED,
                        IterativeDepthFirstSearchAlgorithm.NodeStatus.ACTIVE,
                        IterativeDepthFirstSearchAlgorithm.NodeStatus.PROCESSED,
                        IterativeDepthFirstSearchAlgorithm.NodeStatus.PROCESSED);
        assertThat(trace.events().getFirst().state().stack()).containsExactly("A");
        assertThat(trace.events().subList(1, 4)).allSatisfy(event -> {
            assertThat(event.state().stack()).isEmpty();
            assertThat(event.state().examinedEdge()).isNull();
        });
        assertThat(trace.events()).allSatisfy(event -> {
            assertThat(event.state().parents()).isEmpty();
            assertThat(event.state().examinedEdge()).isNull();
        });
        assertThatThrownBy(() -> trace.events().getFirst().state().stack().add("B"))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> trace.events().getFirst().state().nodeStatuses()
                .put("B", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void reportsSingleNodeTraversalResultAndMetrics() {
        var result = new IterativeDepthFirstSearchAlgorithm().execute(List.of("A"), "A").result();

        assertThat(result.traversalOrder()).containsExactly("A");
        assertThat(result.parents()).isEmpty();
        assertThat(result.unreachableNodes()).isEmpty();
        assertThat(result.visitedNodeCount()).isEqualTo(1);
        assertThat(result.edgeExaminationCount()).isZero();
        assertThat(result.maximumStackSize()).isEqualTo(1);
    }
}
