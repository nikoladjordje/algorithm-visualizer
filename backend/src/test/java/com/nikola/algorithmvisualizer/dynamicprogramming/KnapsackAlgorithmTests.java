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
                trace.events().subList(0, 3).stream().map(KnapsackAlgorithm.Event::type).toList());
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
                trace.events().subList(0, 13).stream().map(KnapsackAlgorithm.Event::type).toList());
        assertEquals(List.of(List.of(0, 0, 0, 0), List.of(0, 4, 4, 4), List.of(0, 4, 5, 9)),
                trace.events().get(12).state().table());
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

    @Test
    void reconstructsAnOptimalSelectionAndExcludesEqualValueTies() {
        var trace = new KnapsackAlgorithm().execute(List.of(
                new KnapsackAlgorithm.Item("Map", 1, 4),
                new KnapsackAlgorithm.Item("Compass", 2, 5),
                new KnapsackAlgorithm.Item("Guide", 1, 4)), 3);

        assertIterableEquals(List.of("RECONSTRUCTION_STARTED", "ITEM_EXCLUDED", "ITEM_SELECTED",
                "ITEM_SELECTED", "RECONSTRUCTION_COMPLETED"), trace.events().subList(19, 24).stream()
                        .map(KnapsackAlgorithm.Event::type).toList());
        assertEquals(List.of("Map", "Compass"), trace.result().selectedItems().stream()
                .map(KnapsackAlgorithm.Item::name).toList());
        assertEquals(3, trace.result().totalSelectedWeight());
        assertEquals("EXCLUDE", trace.events().get(20).data().selectedBranch());
        assertEquals("Guide", trace.events().get(20).data().itemName());
        assertEquals(List.of(new KnapsackAlgorithm.Cell(2, 3)), trace.events().get(20).state().dependencyCells());
    }

    @Test
    void completesReconstructionWithAnExplicitEmptySelection() {
        var trace = new KnapsackAlgorithm().execute(List.of(
                new KnapsackAlgorithm.Item("Tent", 2, 7)), 0);

        assertEquals("RECONSTRUCTION_COMPLETED", trace.events().getLast().type());
        assertEquals(List.of(), trace.result().selectedItems());
        assertEquals(0, trace.result().totalSelectedWeight());
        assertEquals(List.of(), trace.events().getLast().state().selectedItems());
    }

    @Test
    void reconstructsASelectionThatLeavesCapacityUnusedAndExcludesIneligibleItems() {
        var trace = new KnapsackAlgorithm().execute(List.of(
                new KnapsackAlgorithm.Item("Anvil", 5, 10),
                new KnapsackAlgorithm.Item("Map", 2, 4)), 3);

        assertEquals(4, trace.result().maximumValue());
        assertEquals(2, trace.result().totalSelectedWeight());
        assertEquals(List.of("Map"), trace.result().selectedItems().stream().map(KnapsackAlgorithm.Item::name)
                .toList());
        var anvil = trace.events().stream().filter(event -> "Anvil".equals(event.data().itemName()))
                .filter(event -> "ITEM_EXCLUDED".equals(event.type())).findFirst().orElseThrow();
        assertEquals("EXCLUDE", anvil.data().selectedBranch());
        assertEquals(List.of(1), trace.events().getLast().state().selectedItemIndices());
    }
}
