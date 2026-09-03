package com.nikola.algorithmvisualizer.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;

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

    @Test
    void traversesConnectedGraphsInNodeDeclarationOrderWithCompleteImmutableSnapshots() {
        var algorithm = new BreadthFirstSearchAlgorithm();
        var trace = algorithm.execute(
                List.of("A", "C", "B", "D"),
                List.of(
                        new BreadthFirstSearchAlgorithm.Edge("A", "B"),
                        new BreadthFirstSearchAlgorithm.Edge("A", "C"),
                        new BreadthFirstSearchAlgorithm.Edge("C", "D"),
                        new BreadthFirstSearchAlgorithm.Edge("B", "D")),
                "A");

        assertThat(trace.result().traversalOrder()).containsExactly("A", "C", "B", "D");
        assertThat(trace.result().parents()).containsExactlyInAnyOrderEntriesOf(
                Map.of("C", "A", "B", "A", "D", "C"));
        assertThat(trace.result().visitedNodeCount()).isEqualTo(4);
        assertThat(trace.result().edgeExaminationCount()).isEqualTo(8);
        assertThat(trace.result().maximumQueueSize()).isEqualTo(2);
        assertThat(trace.events()).extracting(BreadthFirstSearchAlgorithm.Event::sequence)
                .containsExactlyElementsOf(java.util.stream.IntStream.rangeClosed(1, trace.events().size())
                        .boxed().toList());
        assertThat(trace.events()).extracting(BreadthFirstSearchAlgorithm.Event::type)
                .containsSubsequence(
                        BreadthFirstSearchAlgorithm.EventType.NODE_DEQUEUED,
                        BreadthFirstSearchAlgorithm.EventType.EDGE_EXAMINED,
                        BreadthFirstSearchAlgorithm.EventType.NODE_DISCOVERED,
                        BreadthFirstSearchAlgorithm.EventType.EDGE_EXAMINED,
                        BreadthFirstSearchAlgorithm.EventType.ALREADY_DISCOVERED_SKIPPED,
                        BreadthFirstSearchAlgorithm.EventType.NODE_COMPLETED);
        assertThat(trace.events()).allSatisfy(event -> {
            assertThat(event.state().nodeStatuses()).containsOnlyKeys("A", "C", "B", "D");
            assertThat(event.state().queue()).isNotNull();
            assertThat(event.state().traversalOrder()).isNotNull();
            assertThat(event.state().parents()).isNotNull();
        });
        assertThatThrownBy(() -> trace.events().getFirst().state().nodeStatuses()
                .put("A", BreadthFirstSearchAlgorithm.NodeStatus.UNREACHED))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> trace.events().getFirst().state().queue().add("C"))
                .isInstanceOf(UnsupportedOperationException.class);

        var chain = algorithm.execute(
                List.of("A", "B", "C"),
                List.of(new BreadthFirstSearchAlgorithm.Edge("B", "C"),
                        new BreadthFirstSearchAlgorithm.Edge("A", "B")),
                "A");
        assertThat(chain.result().traversalOrder()).containsExactly("A", "B", "C");
        assertThat(chain.result().parents()).containsEntry("B", "A").containsEntry("C", "B");
        assertThat(chain.result().edgeExaminationCount()).isEqualTo(4);
    }
}
