package com.nikola.algorithmvisualizer.trace;

import java.util.List;

public record AlgorithmCatalogEntry(
        String id,
        String name,
        boolean available,
        String contractVersion,
        TraceLimits inputConstraints,
        List<MetricType> metricTypes
) {
    public AlgorithmCatalogEntry {
        metricTypes = List.copyOf(metricTypes);
    }
}
