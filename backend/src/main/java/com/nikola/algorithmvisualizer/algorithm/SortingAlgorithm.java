package com.nikola.algorithmvisualizer.algorithm;

import java.util.List;

import com.nikola.algorithmvisualizer.trace.VersionedAlgorithmTrace;
import com.nikola.algorithmvisualizer.trace.AlgorithmInfo;

public interface SortingAlgorithm<D extends com.nikola.algorithmvisualizer.trace.EventData> {
    String id();
    AlgorithmInfo info();
    java.util.List<com.nikola.algorithmvisualizer.trace.MetricType> metricTypes();
    VersionedAlgorithmTrace<D> execute(List<Integer> input);
}
