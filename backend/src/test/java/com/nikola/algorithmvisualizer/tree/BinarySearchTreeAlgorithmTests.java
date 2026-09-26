package com.nikola.algorithmvisualizer.tree;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;

import java.util.List;

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
}
