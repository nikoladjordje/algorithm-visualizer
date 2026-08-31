package com.nikola.algorithmvisualizer.trace;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TraceEventBuilder {

    private final int maxEvents;
    private final List<SemanticEvent<EventData>> events = new ArrayList<>();
    private final Map<String, Integer> counts = new LinkedHashMap<>();

    public TraceEventBuilder(int maxEvents) {
        this.maxEvents = maxEvents;
        for (SemanticEventType type : SemanticEventType.values()) {
            counts.put(type.name(), 0);
        }
    }

    public void add(SemanticEventType type, String lineId, List<TraceItem> state,
            List<SortedRange> sortedRanges, EventData data) {
        if (events.size() >= maxEvents) {
            throw new TraceLimitExceededException(maxEvents);
        }
        events.add(new SemanticEvent<>(events.size() + 1, type, lineId, state, sortedRanges, data));
        counts.compute(type.name(), (ignored, count) -> count + 1);
    }

    public List<SemanticEvent<EventData>> events() {
        return List.copyOf(events);
    }

    public Map<String, Integer> counts() {
        return Map.copyOf(counts);
    }

}
