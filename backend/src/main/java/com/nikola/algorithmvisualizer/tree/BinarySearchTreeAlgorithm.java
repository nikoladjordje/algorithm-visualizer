package com.nikola.algorithmvisualizer.tree;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class BinarySearchTreeAlgorithm {
    public enum Operation { PREORDER, INORDER, POSTORDER, LOOKUP }

    public Trace execute(List<Integer> insertionValues, Operation operation) {
        return execute(insertionValues, operation, null);
    }

    public Trace execute(List<Integer> insertionValues, Operation operation, Integer lookupTarget) {
        if (operation == Operation.LOOKUP && lookupTarget == null) {
            throw new IllegalArgumentException("Lookup requires a target");
        }
        var nodes = new ArrayList<Node>();
        var events = new ArrayList<Event>();
        var sequence = new Sequence();
        emit(events, sequence, "TREE_INITIALIZED", "tree-initialize", nodes, null, null, null, null, null,
                List.of());

        Node root = null;
        int comparisons = 0;
        for (int value : insertionValues) {
            if (root == null) {
                root = new Node(nodes.size() + 1, value, null);
                nodes.add(root);
                emit(events, sequence, "NODE_ATTACHED", "tree-attach-root", nodes, root.id, null, "root", null,
                        root.id, List.of());
                continue;
            }
            Node current = root;
            while (true) {
                emit(events, sequence, "INSERTION_NODE_VISITED", "tree-insertion-visit", nodes, current.id, null,
                        null, null, null, List.of());
                String direction = value < current.value ? "left" : "right";
                comparisons++;
                emit(events, sequence, "INSERTION_COMPARED", "tree-insertion-compare", nodes, current.id, null,
                        null, direction, null, List.of());
                Node child = direction.equals("left") ? current.left : current.right;
                if (child == null) {
                    Node attached = new Node(nodes.size() + 1, value, current.id);
                    nodes.add(attached);
                    if (direction.equals("left")) current.left = attached; else current.right = attached;
                    emit(events, sequence, "NODE_ATTACHED", "tree-attach-child", nodes, attached.id, current.id,
                            direction, null, attached.id, List.of());
                    break;
                }
                current = child;
            }
        }
        emit(events, sequence, "CONSTRUCTION_COMPLETED", "tree-construction-complete", nodes, null, null, null,
                null, null, List.of());

        if (operation == Operation.LOOKUP) {
            return lookup(root, nodes, events, sequence, lookupTarget, comparisons, insertionValues.size());
        }
        var traversal = new ArrayList<Integer>();
        if (operation == Operation.INORDER) {
            visitInorder(root, nodes, events, sequence, traversal);
        } else if (operation == Operation.POSTORDER) {
            visitPostorder(root, nodes, events, sequence, traversal);
        } else {
            visitPreorder(root, nodes, events, sequence, traversal);
        }
        emit(events, sequence, "OPERATION_COMPLETED", "tree-operation-complete", nodes, null, null, null, null,
                null, traversal);
        return new Trace(List.copyOf(events), new Result(operation.name(), null, null, null, traversal, traversal.size(),
                null, comparisons, insertionValues.size()));
    }

    private static Trace lookup(Node root, List<Node> nodes, List<Event> events, Sequence sequence, int target,
            int constructionComparisons, int constructionAttachments) {
        var lookupPath = new ArrayList<Integer>();
        Node current = root;
        int comparisons = 0;
        while (current != null) {
            lookupPath.add(current.value);
            emit(events, sequence, "LOOKUP_NODE_VISITED", "tree-lookup-visit", nodes, current.id, null, null,
                    null, null, List.of(), target, lookupPath);
            comparisons++;
            if (target == current.value) {
                emit(events, sequence, "LOOKUP_FOUND", "tree-lookup-found", nodes, current.id, null, null, null,
                        null, List.of(), target, lookupPath);
                emit(events, sequence, "OPERATION_COMPLETED", "tree-lookup-complete", nodes, null, null, null,
                        null, null, List.of(), target, lookupPath);
                return new Trace(List.copyOf(events), new Result("LOOKUP", true, target, current.id, lookupPath,
                        lookupPath.size(), comparisons, constructionComparisons, constructionAttachments));
            }
            String direction = target < current.value ? "left" : "right";
            emit(events, sequence, "LOOKUP_COMPARED", "tree-lookup-compare", nodes, current.id, null, null,
                    direction, null, List.of(), target, lookupPath);
            current = direction.equals("left") ? current.left : current.right;
        }
        emit(events, sequence, "LOOKUP_NOT_FOUND", "tree-lookup-not-found", nodes, null, null, null, null, null,
                List.of(), target, lookupPath);
        emit(events, sequence, "OPERATION_COMPLETED", "tree-lookup-complete", nodes, null, null, null, null,
                null, List.of(), target, lookupPath);
        return new Trace(List.copyOf(events), new Result("LOOKUP", false, target, null, lookupPath,
                lookupPath.size(), comparisons, constructionComparisons, constructionAttachments));
    }

    private static void visitPreorder(Node node, List<Node> nodes, List<Event> events, Sequence sequence,
            List<Integer> preorder) {
        if (node == null) return;
        preorder.add(node.value);
        emit(events, sequence, "TRAVERSAL_NODE_VISITED", "tree-preorder-visit", nodes, node.id, null, null, null,
                null, preorder);
        visitPreorder(node.left, nodes, events, sequence, preorder);
        visitPreorder(node.right, nodes, events, sequence, preorder);
    }

    private static void visitInorder(Node node, List<Node> nodes, List<Event> events, Sequence sequence,
            List<Integer> inorder) {
        if (node == null) return;
        visitInorder(node.left, nodes, events, sequence, inorder);
        inorder.add(node.value);
        emit(events, sequence, "TRAVERSAL_NODE_VISITED", "tree-inorder-visit", nodes, node.id, null, null, null,
                null, inorder);
        visitInorder(node.right, nodes, events, sequence, inorder);
    }

    private static void visitPostorder(Node node, List<Node> nodes, List<Event> events, Sequence sequence,
            List<Integer> postorder) {
        if (node == null) return;
        visitPostorder(node.left, nodes, events, sequence, postorder);
        visitPostorder(node.right, nodes, events, sequence, postorder);
        postorder.add(node.value);
        emit(events, sequence, "TRAVERSAL_NODE_VISITED", "tree-postorder-visit", nodes, node.id, null, null,
                null, null, postorder);
    }

    private static void emit(List<Event> events, Sequence sequence, String type, String pseudocodeLineId,
            List<Node> nodes, Integer activeNodeId, Integer parentId, String position, String direction,
            Integer attachedNodeId, List<Integer> traversalOrder) {
        emit(events, sequence, type, pseudocodeLineId, nodes, activeNodeId, parentId, position, direction,
                attachedNodeId, traversalOrder, null, List.of());
    }

    private static void emit(List<Event> events, Sequence sequence, String type, String pseudocodeLineId,
            List<Node> nodes, Integer activeNodeId, Integer parentId, String position, String direction,
            Integer attachedNodeId, List<Integer> traversalOrder, Integer lookupTarget, List<Integer> lookupPath) {
        var snapshot = nodes.stream().map(node -> new TreeNode(node.id, node.value, node.parentId,
                node.left == null ? null : node.left.id, node.right == null ? null : node.right.id)).toList();
        Integer rootId = snapshot.isEmpty() ? null : snapshot.getFirst().id();
        events.add(new Event(sequence.next(), type, pseudocodeLineId,
                new State("TREE", snapshot, rootId, activeNodeId, List.copyOf(traversalOrder), direction, attachedNodeId,
                        lookupTarget, List.copyOf(lookupPath)),
                new Data(type, activeNodeId, parentId, position, direction, attachedNodeId)));
    }

    private static final class Node {
        private final int id;
        private final int value;
        private final Integer parentId;
        private Node left;
        private Node right;

        private Node(int id, int value, Integer parentId) {
            this.id = id;
            this.value = value;
            this.parentId = parentId;
        }
    }

    private static final class Sequence {
        private int value;
        int next() { return ++value; }
    }

    public record Trace(List<Event> events, Result result) { public Trace { events = List.copyOf(events); } }
    public record Event(int sequence, String type, String pseudocodeLineId, State state, Data data) { }
    public record State(String kind, List<TreeNode> nodes, Integer rootId, Integer activeNodeId,
            List<Integer> traversalOrder, String comparisonDirection, Integer attachedNodeId, Integer lookupTarget,
            List<Integer> lookupPath) {
        public State { nodes = List.copyOf(nodes); traversalOrder = List.copyOf(traversalOrder); lookupPath = List.copyOf(lookupPath); }
    }
    public record TreeNode(int id, int value, Integer parentId, Integer leftId, Integer rightId) { }
    public record Data(String kind, Integer nodeId, Integer parentId, String position, String direction,
            Integer attachedNodeId) { }
    public record Result(String kind, Boolean found, Integer target, Integer matchedNodeId, List<Integer> visitedValues,
            int visitedNodeCount, Integer comparisonCount, int constructionComparisonCount, int constructionAttachmentCount) {
        public Result { visitedValues = List.copyOf(visitedValues); }
    }
}
