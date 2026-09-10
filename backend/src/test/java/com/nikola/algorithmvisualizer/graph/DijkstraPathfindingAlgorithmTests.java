package com.nikola.algorithmvisualizer.graph;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class DijkstraPathfindingAlgorithmTests {

    private final DijkstraPathfindingAlgorithm algorithm = new DijkstraPathfindingAlgorithm();

    @Test
    void findsMinimumCostPathAndReportsOnlyWorkBeforeDestinationSettlement() {
        var trace = algorithm.execute(List.of("A", "C", "B", "D"), List.of(
                edge("A", "B", 10), edge("A", "C", 1), edge("C", "B", 1),
                edge("B", "D", 1), edge("C", "D", 10)), "A", "D");

        assertThat(trace.result().pathFound()).isTrue();
        assertThat(trace.result().path()).containsExactly("A", "C", "B", "D");
        assertThat(trace.result().totalCost()).isEqualTo(3);
        assertThat(trace.result().settledOrder()).containsExactly("A", "C", "B", "D");
        assertThat(trace.result().parents()).containsEntry("B", "C").containsEntry("D", "B");
        assertThat(trace.result().settledNodeCount()).isEqualTo(4);
        assertThat(trace.result().relaxationAttemptCount()).isEqualTo(8);
        assertThat(trace.result().successfulUpdateCount()).isEqualTo(5);
        assertThat(trace.result().rejectedUpdateCount()).isEqualTo(3);
        assertThat(trace.result().maximumFrontierSize()).isEqualTo(2);
        assertThat(trace.events().getLast().type())
                .isEqualTo(DijkstraPathfindingAlgorithm.EventType.PATH_RECONSTRUCTED);
        assertThat(trace.events().getLast().state().selectedPath())
                .containsExactly("A", "C", "B", "D");
    }

    @Test
    void resolvesEqualFrontierDistancesAndEqualRoutesByDeclarationOrder() {
        var trace = algorithm.execute(List.of("A", "C", "B", "D"), List.of(
                edge("A", "B", 1), edge("B", "D", 1),
                edge("A", "C", 1), edge("C", "D", 1)), "A", "D");

        assertThat(trace.result().settledOrder()).containsExactly("A", "C", "B", "D");
        assertThat(trace.result().path()).containsExactly("A", "C", "D");
        assertThat(trace.result().parents()).containsEntry("D", "C");
        assertThat(trace.events()).anySatisfy(event -> {
            assertThat(event.type()).isEqualTo(DijkstraPathfindingAlgorithm.EventType.RELAXATION_REJECTED);
            var data = (DijkstraPathfindingAlgorithm.RelaxationData) event.data();
            assertThat(data.from()).isEqualTo("B");
            assertThat(data.to()).isEqualTo("D");
            assertThat(data.candidateCost()).isEqualTo(data.currentKnownCost());
        });
    }

    @Test
    void discardsStalePrioritiesAndReturnsANormalNoPathResult() {
        var trace = algorithm.execute(List.of("A", "C", "B", "Z"), List.of(
                edge("A", "B", 10), edge("A", "C", 1), edge("C", "B", 1)), "A", "Z");

        assertThat(trace.result().pathFound()).isFalse();
        assertThat(trace.result().path()).isEmpty();
        assertThat(trace.result().totalCost()).isNull();
        assertThat(trace.result().settledOrder()).containsExactly("A", "C", "B");
        assertThat(trace.events()).anySatisfy(event -> {
            assertThat(event.type())
                    .isEqualTo(DijkstraPathfindingAlgorithm.EventType.STALE_FRONTIER_ENTRY_SKIPPED);
            var data = (DijkstraPathfindingAlgorithm.StaleEntryData) event.data();
            assertThat(data.node()).isEqualTo("B");
            assertThat(data.queuedDistance()).isEqualTo(10);
            assertThat(data.currentDistance()).isEqualTo(2);
        });
        assertThat(trace.events().getLast().data())
                .isEqualTo(new DijkstraPathfindingAlgorithm.PathData(
                        "PATH_RECONSTRUCTED", "Z", false, List.of(), null));
    }

    @Test
    void choosesLowerCostPathEvenWhenItUsesMoreEdges() {
        var trace = algorithm.execute(List.of("A", "B", "C", "D"), List.of(
                edge("A", "D", 9), edge("A", "B", 2),
                edge("B", "C", 2), edge("C", "D", 2)), "A", "D");

        assertThat(trace.result().path()).containsExactly("A", "B", "C", "D");
        assertThat(trace.result().totalCost()).isEqualTo(6);
    }

    @Test
    void handlesStartEqualToDestinationWithAStableImmutableTrace() {
        var trace = algorithm.execute(List.of("A", "B"), List.of(edge("A", "B", 7)), "A", "A");

        assertThat(trace.result().path()).containsExactly("A");
        assertThat(trace.result().totalCost()).isZero();
        assertThat(trace.result().relaxationAttemptCount()).isZero();
        assertThat(trace.events()).hasSize(4);
        assertThat(trace.events()).extracting(DijkstraPathfindingAlgorithm.Event::type).containsExactly(
                DijkstraPathfindingAlgorithm.EventType.PATHFINDING_INITIALIZED,
                DijkstraPathfindingAlgorithm.EventType.NODE_SELECTED,
                DijkstraPathfindingAlgorithm.EventType.NODE_SETTLED,
                DijkstraPathfindingAlgorithm.EventType.PATH_RECONSTRUCTED);
        assertThatThrownByMutation(trace);
    }

    private static void assertThatThrownByMutation(DijkstraPathfindingAlgorithm.Trace trace) {
        assertThat(trace.events()).isUnmodifiable();
        assertThat(trace.result().path()).isUnmodifiable();
        assertThat(trace.events().getFirst().state().nodeStatuses()).isUnmodifiable();
        assertThat(trace.events().getFirst().state().tentativeDistances()).isUnmodifiable();
        assertThat(trace.events().getFirst().state().frontier()).isUnmodifiable();
    }

    private static DijkstraPathfindingAlgorithm.Edge edge(String from, String to, int weight) {
        return new DijkstraPathfindingAlgorithm.Edge(from, to, weight);
    }
}
