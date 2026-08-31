package com.nikola.algorithmvisualizer.trace;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class TraceEventBuilderTests {

    @Test
    void rejectsEventsBeyondConfiguredLimit() {
        TraceEventBuilder builder = new TraceEventBuilder(1);
        TraceItem first = new TraceItem(0, 2); TraceItem second = new TraceItem(1, 1);
        builder.add(SemanticEventType.SELECT, "select-current", List.of(first, second), List.of(),
                new SelectData(1, second));

        assertThatThrownBy(() -> builder.add(SemanticEventType.READ, "read-adjacent",
                List.of(first, second), List.of(), new ReadData(List.of(0, 1), List.of(first, second))))
                .isInstanceOf(TraceLimitExceededException.class)
                .hasMessageContaining("1");
    }

}
