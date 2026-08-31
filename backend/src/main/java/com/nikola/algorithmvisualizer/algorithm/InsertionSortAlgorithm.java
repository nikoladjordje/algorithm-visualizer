package com.nikola.algorithmvisualizer.algorithm;

import java.util.*;
import org.springframework.stereotype.Service;
import com.nikola.algorithmvisualizer.trace.*;

@Service
public class InsertionSortAlgorithm extends AbstractSortingAlgorithm {
    public String id() { return "insertion"; }
    public AlgorithmInfo info() { return new AlgorithmInfo(id(), "Insertion Sort"); }
    public List<MetricType> metricTypes() { return List.of(MetricType.COMPARISONS, MetricType.READS, MetricType.WRITES, MetricType.SWAPS); }

    public VersionedAlgorithmTrace<EventData> execute(List<Integer> input) {
        List<TraceItem> values = items(input);
        TraceEventBuilder trace = new TraceEventBuilder(MAX_EVENTS);
        if (values.size() == 1) trace.add(SemanticEventType.MARK_SORTED, "complete-pass", values,
                ranges(new SortedRange(0, 0)), new MarkSortedData(0, 0));
        for (int current = 1; current < values.size(); current++) {
            int index = current;
            List<SortedRange> sorted = ranges(new SortedRange(0, current - 1));
            trace.add(SemanticEventType.SELECT, "select-current", values, sorted, new SelectData(index, values.get(index)));
            while (index > 0) {
                TraceItem left = values.get(index - 1), right = values.get(index);
                List<Integer> indices = List.of(index - 1, index);
                trace.add(SemanticEventType.READ, "read-adjacent", values, sorted, new ReadData(indices, List.of(left, right)));
                trace.add(SemanticEventType.COMPARE, "compare-adjacent", values, sorted,
                        new CompareData(indices, List.of(left, right), compare(left, right)));
                if (left.value() <= right.value()) break;
                trace.add(SemanticEventType.SWAP, "swap-adjacent", values, sorted, new SwapData(indices));
                Collections.swap(values, index - 1, index);
                List<SortedRange> remainingSorted = index > 1
                        ? ranges(new SortedRange(0, index - 2)) : List.of();
                trace.add(SemanticEventType.WRITE, "write-swapped-values", values, remainingSorted,
                        new WriteData(indices, List.of(values.get(index - 1), values.get(index))));
                index--;
                trace.add(SemanticEventType.SELECT, "move-left", values, remainingSorted,
                        new SelectData(index, values.get(index)));
            }
            trace.add(SemanticEventType.MARK_SORTED, "complete-pass", values,
                    ranges(new SortedRange(0, current)), new MarkSortedData(0, current));
        }
        return result(input, values, trace);
    }
}
