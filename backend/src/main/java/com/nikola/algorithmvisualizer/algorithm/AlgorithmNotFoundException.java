package com.nikola.algorithmvisualizer.algorithm;
public class AlgorithmNotFoundException extends RuntimeException {
    public AlgorithmNotFoundException(String id) { super("Algorithm '" + id + "' is not available"); }
}
