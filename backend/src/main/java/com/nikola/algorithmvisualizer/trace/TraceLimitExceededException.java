package com.nikola.algorithmvisualizer.trace;

public class TraceLimitExceededException extends RuntimeException {
    public TraceLimitExceededException(int maxEvents) {
        super("The algorithm trace would exceed the limit of " + maxEvents + " events");
    }
}
