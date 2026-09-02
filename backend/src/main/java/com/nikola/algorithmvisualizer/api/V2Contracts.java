package com.nikola.algorithmvisualizer.api;

import java.util.List;

import com.nikola.algorithmvisualizer.algorithm.ComparisonResult;
import com.nikola.algorithmvisualizer.trace.SortedRange;
import com.nikola.algorithmvisualizer.trace.TraceItem;

final class V2Contracts {
    private V2Contracts() {
    }

    record CatalogEntry(String id, String name, String family, String contractVersion,
            Constraints constraints) {
    }

    sealed interface Constraints permits SortingConstraints, GraphTraversalConstraints {
        String kind();
    }

    record SortingConstraints(String kind, int minimumValues, int maximumValues,
            int minimumValue, int maximumValue) implements Constraints { }

    record GraphTraversalConstraints(String kind, int minimumNodes, int maximumNodes,
            int maximumEdges, String nodeLabelPattern, boolean directed, boolean weighted)
            implements Constraints { }

    record AlgorithmInfo(String id, String name, String family) {
    }

    record SortingInput(String kind, List<Integer> values) {
        SortingInput {
            values = List.copyOf(values);
        }
    }

    record SortingResult(String kind, List<Integer> values) {
        SortingResult {
            values = List.copyOf(values);
        }
    }

    record Limits(int maximumEvents) {
    }

    record GraphTraversalInput(String kind, List<String> nodes, List<GraphEdge> edges,
            String startNode) {
        GraphTraversalInput {
            nodes = List.copyOf(nodes);
            edges = List.copyOf(edges);
        }
    }

    record GraphEdge(String from, String to) { }

    record GraphTraversalTrace(String apiVersion, AlgorithmInfo algorithm,
            GraphTraversalInput input, com.nikola.algorithmvisualizer.graph.BreadthFirstSearchAlgorithm.Result result,
            Limits limits,
            List<com.nikola.algorithmvisualizer.graph.BreadthFirstSearchAlgorithm.Event> events) {
        GraphTraversalTrace { events = List.copyOf(events); }
    }

    record SortingState(String kind, List<TraceItem> items, List<SortedRange> sortedRanges) {
        SortingState {
            items = List.copyOf(items);
            sortedRanges = List.copyOf(sortedRanges);
        }
    }

    sealed interface SortingEventData permits SelectEventData, ReadEventData, CompareEventData,
            SwapEventData, WriteEventData, RangeEventData, PassEventData, MinimumEventData,
            MergeEventData, PartitionEventData, HeapEventData {
        String kind();
    }

    record SelectEventData(String kind, int index, TraceItem item) implements SortingEventData {
    }

    record ReadEventData(String kind, List<Integer> indices, List<TraceItem> items)
            implements SortingEventData {
        ReadEventData {
            indices = List.copyOf(indices);
            items = List.copyOf(items);
        }
    }

    record CompareEventData(String kind, List<Integer> indices, List<TraceItem> items,
            ComparisonResult result) implements SortingEventData {
        CompareEventData {
            indices = List.copyOf(indices);
            items = List.copyOf(items);
        }
    }

    record SwapEventData(String kind, List<Integer> indices) implements SortingEventData {
        SwapEventData {
            indices = List.copyOf(indices);
        }
    }

    record WriteEventData(String kind, List<Integer> indices, List<TraceItem> items)
            implements SortingEventData {
        WriteEventData {
            indices = List.copyOf(indices);
            items = List.copyOf(items);
        }
    }

    record RangeEventData(String kind, int fromIndex, int throughIndex)
            implements SortingEventData {
    }

    record PassEventData(String kind, int pass, boolean swapped) implements SortingEventData {
    }

    record MinimumEventData(String kind, int index, TraceItem item) implements SortingEventData {
    }

    record MergeEventData(String kind, int left, int middle, int right, List<TraceItem> buffer)
            implements SortingEventData {
        MergeEventData {
            buffer = List.copyOf(buffer);
        }
    }

    record PartitionEventData(String kind, int left, int right, int scanner, int boundary,
            int pivotIndex) implements SortingEventData {
    }

    record HeapEventData(String kind, int heapSize, int rootIndex, int childIndex)
            implements SortingEventData {
    }

    record SortingEvent(int sequence, String type, String pseudocodeLineId, SortingState state,
            SortingEventData data) {
    }

    record SortingTrace(String apiVersion, AlgorithmInfo algorithm, SortingInput input,
            SortingResult result, Limits limits, List<SortingEvent> events) {
        SortingTrace {
            events = List.copyOf(events);
        }
    }
}
