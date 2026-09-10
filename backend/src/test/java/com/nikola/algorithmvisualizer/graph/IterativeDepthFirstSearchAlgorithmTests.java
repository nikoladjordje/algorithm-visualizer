package com.nikola.algorithmvisualizer.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;

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

    @Test
    void traversesByNodeDeclarationOrderRegardlessOfEdgeOrderOrStackInsertion() {
        var trace = new IterativeDepthFirstSearchAlgorithm().execute(
                List.of("A", "C", "B", "D"),
                List.of(
                        new IterativeDepthFirstSearchAlgorithm.Edge("B", "D"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("A", "B"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("C", "D"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("A", "C")),
                "A");

        assertThat(trace.result().traversalOrder()).containsExactly("A", "C", "D", "B");
        assertThat(trace.result().parents())
                .containsEntry("C", "A")
                .containsEntry("B", "A")
                .containsEntry("D", "C")
                .hasSize(3);
        assertThat(trace.result().unreachableNodes()).isEmpty();
        assertThat(trace.result().visitedNodeCount()).isEqualTo(4);
        assertThat(trace.result().edgeExaminationCount()).isEqualTo(8);
        assertThat(trace.result().maximumStackSize()).isEqualTo(2);
        assertThat(trace.events()).extracting(IterativeDepthFirstSearchAlgorithm.Event::sequence)
                .containsExactlyElementsOf(java.util.stream.IntStream.rangeClosed(1, trace.events().size())
                        .boxed().toList());
    }

    @Test
    void discoversEachCycleNodeOnceAndEmitsEveryEdgeDecision() {
        var trace = new IterativeDepthFirstSearchAlgorithm().execute(
                List.of("A", "B", "C"),
                List.of(
                        new IterativeDepthFirstSearchAlgorithm.Edge("C", "A"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("B", "C"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("A", "B")),
                "A");

        assertThat(trace.result().traversalOrder()).containsExactly("A", "B", "C");
        assertThat(trace.events()).filteredOn(event ->
                        event.type() == IterativeDepthFirstSearchAlgorithm.EventType.NODE_DISCOVERED)
                .hasSize(2);
        assertThat(trace.events()).filteredOn(event ->
                        event.type() == IterativeDepthFirstSearchAlgorithm.EventType.EDGE_EXAMINED)
                .hasSize(6);
        assertThat(trace.events()).filteredOn(event ->
                        event.type() == IterativeDepthFirstSearchAlgorithm.EventType.ALREADY_DISCOVERED_SKIPPED)
                .hasSize(4);
        assertThat(trace.events()).allSatisfy(event ->
                assertThat(event.state().stack()).doesNotHaveDuplicates());
    }

    @Test
    void leavesDisconnectedNodesUnreachedInDeclarationOrder() {
        var trace = new IterativeDepthFirstSearchAlgorithm().execute(
                List.of("Z", "A", "M", "Q"),
                List.of(
                        new IterativeDepthFirstSearchAlgorithm.Edge("Z", "M"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("A", "Q")),
                "A");

        assertThat(trace.result().traversalOrder()).containsExactly("A", "Q");
        assertThat(trace.result().unreachableNodes()).containsExactly("Z", "M");
        assertThat(trace.result().parents()).containsExactly(Map.entry("Q", "A"));
        assertThat(trace.result().edgeExaminationCount()).isEqualTo(2);
        assertThat(trace.events().getLast().state().nodeStatuses())
                .containsEntry("Z", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED)
                .containsEntry("M", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED);
    }

    @Test
    void snapshotsOnlyMoveStatusesForwardAndNeverExposeMultipleActiveNodes() {
        var trace = new IterativeDepthFirstSearchAlgorithm().execute(
                List.of("A", "B", "C", "D"),
                List.of(
                        new IterativeDepthFirstSearchAlgorithm.Edge("A", "B"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("A", "C"),
                        new IterativeDepthFirstSearchAlgorithm.Edge("B", "D")),
                "A");
        Map<IterativeDepthFirstSearchAlgorithm.NodeStatus, Integer> rank = Map.of(
                IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED, 0,
                IterativeDepthFirstSearchAlgorithm.NodeStatus.DISCOVERED, 1,
                IterativeDepthFirstSearchAlgorithm.NodeStatus.ACTIVE, 2,
                IterativeDepthFirstSearchAlgorithm.NodeStatus.PROCESSED, 3);
        Map<String, IterativeDepthFirstSearchAlgorithm.NodeStatus> previous = Map.of(
                "A", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED,
                "B", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED,
                "C", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED,
                "D", IterativeDepthFirstSearchAlgorithm.NodeStatus.UNREACHED);

        for (var event : trace.events()) {
            assertThat(event.state().nodeStatuses().values())
                    .filteredOn(status -> status == IterativeDepthFirstSearchAlgorithm.NodeStatus.ACTIVE)
                    .hasSizeLessThanOrEqualTo(1);
            for (String node : previous.keySet()) {
                assertThat(rank.get(event.state().nodeStatuses().get(node)))
                        .isGreaterThanOrEqualTo(rank.get(previous.get(node)));
            }
            previous = event.state().nodeStatuses();
        }
    }
}
