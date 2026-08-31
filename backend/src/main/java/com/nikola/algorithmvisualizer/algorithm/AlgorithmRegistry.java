package com.nikola.algorithmvisualizer.algorithm;
import java.util.*;
import org.springframework.stereotype.Component;
import com.nikola.algorithmvisualizer.trace.*;

@Component
public class AlgorithmRegistry {
    private static final List<String> ORDER = List.of("insertion", "selection", "bubble", "merge", "quick", "heap");
    private final Map<String, SortingAlgorithm<?>> algorithms = new LinkedHashMap<>();
    public AlgorithmRegistry(List<SortingAlgorithm<?>> executors) {
        for (String id : ORDER) executors.stream().filter(item -> item.id().equals(id)).findFirst()
                .ifPresent(item -> algorithms.put(id, item));
    }
    public List<AlgorithmCatalogEntry> catalog() {
        return algorithms.values().stream().map(executor -> new AlgorithmCatalogEntry(executor.id(),
                executor.info().name(), true, "1.0", new TraceLimits(50, 10_000), executor.metricTypes())).toList();
    }
    public SortingAlgorithm<?> require(String id) {
        SortingAlgorithm<?> executor = algorithms.get(id);
        if (executor == null) throw new AlgorithmNotFoundException(id);
        return executor;
    }
}
