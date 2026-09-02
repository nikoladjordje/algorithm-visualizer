package com.nikola.algorithmvisualizer.api;

public class AlgorithmFamilyMismatchException extends RuntimeException {
    public AlgorithmFamilyMismatchException(String algorithmId, String requiredKind) {
        super("Algorithm " + algorithmId + " requires request kind " + requiredKind);
    }
}
