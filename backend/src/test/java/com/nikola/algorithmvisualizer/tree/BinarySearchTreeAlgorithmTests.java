package com.nikola.algorithmvisualizer.tree;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;

class BinarySearchTreeAlgorithmTests {

    private final BinarySearchTreeAlgorithm algorithm = new BinarySearchTreeAlgorithm();

    @Test
    void constructsAnImmutableTreeAndTraversesItInPreorder() {
        var trace = algorithm.execute(List.of(8, 3, 10, 1, 6), BinarySearchTreeAlgorithm.Operation.PREORDER);

        assertIterableEquals(List.of(8, 3, 1, 6, 10), trace.result().visitedValues());
        assertEquals(5, trace.result().visitedNodeCount());
        assertEquals(5, trace.result().constructionAttachmentCount());
        assertEquals("NODE_ATTACHED", trace.events().get(1).type());
        assertEquals("root", trace.events().get(1).data().position());
        assertEquals(1, trace.events().get(1).state().rootId());
        var leftAttachment = trace.events().stream()
                .filter(event -> event.type().equals("NODE_ATTACHED") && event.data().nodeId() == 2)
                .findFirst().orElseThrow();
        assertEquals(1, leftAttachment.data().parentId());
        assertEquals("left", leftAttachment.data().position());
        assertEquals(1, trace.events().get(0).sequence());
        assertEquals(trace.events().size(), trace.events().getLast().sequence());
        assertEquals(List.of(), trace.events().get(1).state().nodes().get(0).leftId() == null
                ? List.of() : List.of(trace.events().get(1).state().nodes().get(0).leftId()));
        assertEquals(2, trace.events().getLast().state().nodes().get(0).leftId());
    }

    @Test
    void traversesABinarySearchTreeInAscendingInorder() {
        var trace = algorithm.execute(List.of(8, 3, 10, 1, 6), BinarySearchTreeAlgorithm.Operation.INORDER);

        assertEquals("INORDER", trace.result().kind());
        assertIterableEquals(List.of(1, 3, 6, 8, 10), trace.result().visitedValues());
        assertEquals(5, trace.result().visitedNodeCount());
        assertEquals(5, trace.result().constructionAttachmentCount());
        assertEquals("TRAVERSAL_NODE_VISITED", trace.events().get(trace.events().size() - 2).type());
        assertEquals("tree-inorder-visit", trace.events().get(trace.events().size() - 2).pseudocodeLineId());
        assertIterableEquals(List.of(1, 3, 6, 8, 10), trace.events().getLast().state().traversalOrder());
        assertThrows(UnsupportedOperationException.class,
                () -> trace.events().getLast().state().traversalOrder().add(11));
    }

    @Test
    void traversesEachSubtreeBeforeItsParentInPostorder() {
        var trace = algorithm.execute(List.of(8, 3, 10, 1, 6), BinarySearchTreeAlgorithm.Operation.POSTORDER);

        assertEquals("POSTORDER", trace.result().kind());
        assertIterableEquals(List.of(1, 6, 3, 10, 8), trace.result().visitedValues());
        assertEquals(5, trace.result().visitedNodeCount());
        assertEquals("TRAVERSAL_NODE_VISITED", trace.events().get(trace.events().size() - 2).type());
        assertEquals("tree-postorder-visit", trace.events().get(trace.events().size() - 2).pseudocodeLineId());
        assertIterableEquals(List.of(1, 6, 3, 10, 8), trace.events().getLast().state().traversalOrder());
        assertThrows(UnsupportedOperationException.class,
                () -> trace.events().getLast().state().traversalOrder().add(11));
    }

    @Test
    void traversesOneNodeSkewedAndMixedTreesInPostorder() {
        var oneNode = algorithm.execute(List.of(4), BinarySearchTreeAlgorithm.Operation.POSTORDER);
        var leftSkewed = algorithm.execute(List.of(5, 4, 3, 2, 1), BinarySearchTreeAlgorithm.Operation.POSTORDER);
        var rightSkewed = algorithm.execute(List.of(1, 2, 3, 4, 5), BinarySearchTreeAlgorithm.Operation.POSTORDER);
        var mixed = algorithm.execute(List.of(10, -5, 20, -10, 0, 15, 25, -7, 17),
                BinarySearchTreeAlgorithm.Operation.POSTORDER);

        assertIterableEquals(List.of(4), oneNode.result().visitedValues());
        assertIterableEquals(List.of(1, 2, 3, 4, 5), leftSkewed.result().visitedValues());
        assertIterableEquals(List.of(5, 4, 3, 2, 1), rightSkewed.result().visitedValues());
        assertIterableEquals(List.of(-7, -10, 0, -5, 17, 15, 25, 20, 10), mixed.result().visitedValues());
        var constructionCompleted = mixed.events().stream()
                .filter(event -> event.type().equals("CONSTRUCTION_COMPLETED"))
                .findFirst().orElseThrow();
        var firstTraversalVisit = mixed.events().stream()
                .filter(event -> event.type().equals("TRAVERSAL_NODE_VISITED"))
                .findFirst().orElseThrow();
        assertEquals(constructionCompleted.sequence() + 1, firstTraversalVisit.sequence());
        assertEquals("OPERATION_COMPLETED", mixed.events().getLast().type());
    }

    @Test
    void traversesOneNodeSkewedMixedAndBoundaryTreesInAscendingOrder() {
        var oneNode = algorithm.execute(List.of(4), BinarySearchTreeAlgorithm.Operation.INORDER);
        var leftSkewed = algorithm.execute(List.of(5, 4, 3, 2, 1), BinarySearchTreeAlgorithm.Operation.INORDER);
        var rightSkewed = algorithm.execute(List.of(1, 2, 3, 4, 5), BinarySearchTreeAlgorithm.Operation.INORDER);
        var mixed = algorithm.execute(List.of(10, -5, 20, -10, 0, 15, 25, -7, 17),
                BinarySearchTreeAlgorithm.Operation.INORDER);
        var boundaries = algorithm.execute(List.of(0, Integer.MAX_VALUE, Integer.MIN_VALUE, -1, 1),
                BinarySearchTreeAlgorithm.Operation.INORDER);
        var deterministicShuffle = algorithm.execute(List.of(12, 4, 19, 1, 8, 15, 23, 6, 10),
                BinarySearchTreeAlgorithm.Operation.INORDER);

        assertIterableEquals(List.of(4), oneNode.result().visitedValues());
        assertIterableEquals(List.of(1, 2, 3, 4, 5), leftSkewed.result().visitedValues());
        assertIterableEquals(List.of(1, 2, 3, 4, 5), rightSkewed.result().visitedValues());
        assertIterableEquals(List.of(-10, -7, -5, 0, 10, 15, 17, 20, 25), mixed.result().visitedValues());
        assertIterableEquals(List.of(Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE), boundaries.result().visitedValues());
        assertIterableEquals(List.of(1, 4, 6, 8, 10, 12, 15, 19, 23), deterministicShuffle.result().visitedValues());
        assertEquals("OPERATION_COMPLETED", deterministicShuffle.events().getLast().type());
        assertEquals(deterministicShuffle.events().size(), deterministicShuffle.events().getLast().sequence());
    }

    @Test
    void traversesReproducibleRandomUniqueValuesInAscendingOrder() {
        var values = new Random(17).ints(-100, 101).distinct().limit(31).boxed().toList();

        var trace = algorithm.execute(values, BinarySearchTreeAlgorithm.Operation.INORDER);

        assertIterableEquals(values.stream().sorted().toList(), trace.result().visitedValues());
    }

    @Test
    void looksUpAnInternalValueWithoutChangingTheConstructedTree() {
        var trace = algorithm.execute(List.of(8, 3, 10, 1, 6), BinarySearchTreeAlgorithm.Operation.LOOKUP, 6);

        assertEquals("LOOKUP", trace.result().kind());
        assertEquals(6, trace.result().target());
        assertEquals(true, trace.result().found());
        assertEquals(5, trace.result().matchedNodeId());
        assertIterableEquals(List.of(8, 3, 6), trace.result().visitedValues());
        assertEquals(3, trace.result().comparisonCount());
        assertIterableEquals(List.of(8, 3, 6), trace.events().getLast().state().lookupPath());
        assertEquals("LOOKUP_FOUND", trace.events().get(trace.events().size() - 2).type());
        assertEquals(2, trace.events().getLast().state().nodes().getFirst().leftId());
    }

    @Test
    void reportsAMissingChildAfterFollowingTheLookupPath() {
        var trace = algorithm.execute(List.of(8, 3, 10), BinarySearchTreeAlgorithm.Operation.LOOKUP, -1);

        assertEquals(false, trace.result().found());
        assertEquals(null, trace.result().matchedNodeId());
        assertIterableEquals(List.of(8, 3), trace.result().visitedValues());
        assertEquals("LOOKUP_NOT_FOUND", trace.events().get(trace.events().size() - 2).type());
        assertEquals(3, trace.events().getLast().state().nodes().size());
    }

    @Test
    void handlesRootLeafRightMissAndSignedIntegerBoundaryLookups() {
        var root = algorithm.execute(List.of(8, 3, 10, 1, 6), BinarySearchTreeAlgorithm.Operation.LOOKUP, 8);
        var leaf = algorithm.execute(List.of(8, 3, 10, 1, 6), BinarySearchTreeAlgorithm.Operation.LOOKUP, 1);
        var rightMiss = algorithm.execute(List.of(8, 3, 10), BinarySearchTreeAlgorithm.Operation.LOOKUP, 11);
        var boundaries = algorithm.execute(List.of(Integer.MIN_VALUE, 0, Integer.MAX_VALUE),
                BinarySearchTreeAlgorithm.Operation.LOOKUP, Integer.MAX_VALUE);

        assertIterableEquals(List.of(8), root.result().visitedValues());
        assertIterableEquals(List.of(8, 3, 1), leaf.result().visitedValues());
        assertIterableEquals(List.of(8, 10), rightMiss.result().visitedValues());
        assertEquals(false, rightMiss.result().found());
        assertEquals(Integer.MAX_VALUE, boundaries.result().matchedNodeId() == null ? null
                : boundaries.events().getLast().state().nodes().get(boundaries.result().matchedNodeId() - 1).value());
        assertThrows(UnsupportedOperationException.class, () -> root.events().getLast().state().nodes().add(null));
        assertThrows(IllegalArgumentException.class,
                () -> algorithm.execute(List.of(8), BinarySearchTreeAlgorithm.Operation.LOOKUP));
    }
}
