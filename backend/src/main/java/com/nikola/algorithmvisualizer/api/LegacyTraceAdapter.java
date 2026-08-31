package com.nikola.algorithmvisualizer.api;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.nikola.algorithmvisualizer.algorithm.AlgorithmEvent;
import com.nikola.algorithmvisualizer.algorithm.AlgorithmEventType;
import com.nikola.algorithmvisualizer.algorithm.AlgorithmTrace;
import com.nikola.algorithmvisualizer.trace.CompareData;
import com.nikola.algorithmvisualizer.trace.MarkSortedData;
import com.nikola.algorithmvisualizer.trace.SemanticEvent;
import com.nikola.algorithmvisualizer.trace.SemanticEventType;
import com.nikola.algorithmvisualizer.trace.SwapData;
import com.nikola.algorithmvisualizer.trace.VersionedAlgorithmTrace;

@Component
public class LegacyTraceAdapter {

    public AlgorithmTrace adapt(VersionedAlgorithmTrace<?> trace) {
        List<AlgorithmEvent> events = new ArrayList<>();
        for (SemanticEvent<?> event : trace.events()) {
            switch (event.type()) {
                case COMPARE -> events.add(compareEvent(event, (CompareData) event.data()));
                case SWAP -> events.add(swapEvent(event, (SwapData) event.data()));
                case MARK_SORTED -> events.add(sortedEvent(event, (MarkSortedData) event.data()));
                default -> { }
            }
        }
        return new AlgorithmTrace(trace.algorithm().name(), trace.inputValues(), trace.summary().resultValues(),
                events, count(trace, SemanticEventType.COMPARE), count(trace, SemanticEventType.SWAP));
    }

    private AlgorithmEvent compareEvent(SemanticEvent<?> event, CompareData data) {
        return new AlgorithmEvent(AlgorithmEventType.COMPARE, data.indices(), values(event),
                "Compare " + data.items().get(0).value() + " and " + data.items().get(1).value(),
                event.pseudocodeLineId(), sortedThrough(event), data.result(), 0);
    }

    private AlgorithmEvent swapEvent(SemanticEvent<?> event, SwapData data) {
        return new AlgorithmEvent(AlgorithmEventType.SWAP, data.indices(), values(event),
                "Swap positions " + data.indices().get(0) + " and " + data.indices().get(1),
                event.pseudocodeLineId(), sortedThrough(event), null, 0);
    }

    private AlgorithmEvent sortedEvent(SemanticEvent<?> event, MarkSortedData data) {
        return new AlgorithmEvent(AlgorithmEventType.PASS_COMPLETE,
                List.of(data.fromIndex(), data.throughIndex()), values(event),
                "Positions " + data.fromIndex() + " through " + data.throughIndex() + " are now sorted",
                event.pseudocodeLineId(), sortedThrough(event), null, 0);
    }

    private int count(VersionedAlgorithmTrace<?> trace, SemanticEventType type) {
        return trace.summary().operationCounts().getOrDefault(type.name(), 0);
    }
    private List<Integer> values(SemanticEvent<?> event) { return event.state().stream().map(item -> item.value()).toList(); }
    private int sortedThrough(SemanticEvent<?> event) { return event.sortedRanges().stream().filter(r -> r.fromIndex() == 0).mapToInt(r -> r.throughIndex()).max().orElse(0); }
}
