package com.nikola.algorithmvisualizer.api;

import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

final class EdgeWeightDeserializer extends ValueDeserializer<Integer> {
    @Override
    public Integer deserialize(JsonParser parser, DeserializationContext context) {
        if (!parser.hasToken(JsonToken.VALUE_NUMBER_INT)) {
            return context.reportInputMismatch(Integer.class, "An edge weight must be a JSON integer from 1 through 99");
        }
        return parser.getIntValue();
    }

    @Override
    public Object getNullValue(DeserializationContext context) {
        return context.reportInputMismatch(Integer.class, "Omit an unweighted edge's weight instead of supplying null");
    }

    @Override
    public Object getAbsentValue(DeserializationContext context) {
        return null;
    }
}
