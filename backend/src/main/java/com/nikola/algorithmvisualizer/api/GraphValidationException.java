package com.nikola.algorithmvisualizer.api;

final class GraphValidationException extends IllegalArgumentException {
    private final String field;

    GraphValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    String field() {
        return field;
    }
}
