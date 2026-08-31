package com.nikola.algorithmvisualizer.contract;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.junit.jupiter.api.Test;

import com.nikola.algorithmvisualizer.algorithm.BubbleSortAlgorithm;
import com.nikola.algorithmvisualizer.algorithm.HeapSortAlgorithm;
import com.nikola.algorithmvisualizer.algorithm.InsertionSortAlgorithm;
import com.nikola.algorithmvisualizer.algorithm.MergeSortAlgorithm;
import com.nikola.algorithmvisualizer.algorithm.QuickSortAlgorithm;
import com.nikola.algorithmvisualizer.algorithm.SelectionSortAlgorithm;
import com.nikola.algorithmvisualizer.algorithm.SortingAlgorithm;
import com.nikola.algorithmvisualizer.trace.SemanticEvent;
import com.nikola.algorithmvisualizer.trace.SortedRange;
import com.nikola.algorithmvisualizer.trace.TraceItem;

import tools.jackson.databind.JsonNode;

class SortingRegressionFixturesTests {

    @Test
    void preservesRepresentativeVisibleStatesAndSemanticStepOrdering() throws IOException {
        JsonNode fixture = V2ContractFixturesTests.readFixture(
                "contracts/v2/sorting-regression-traces.json");
        List<Integer> input = integers(fixture.path("input"));
        List<Integer> expectedResult = integers(fixture.path("result"));
        JsonNode expectedTraces = fixture.path("traces");

        for (Map.Entry<String, SortingAlgorithm<?>> entry : algorithms().entrySet()) {
            var trace = entry.getValue().execute(input);
            List<String> expectedEvents = StreamSupport.stream(
                            expectedTraces.path(entry.getKey()).spliterator(), false)
                    .map(JsonNode::asText)
                    .toList();

            assertThat(trace.summary().resultValues())
                    .as("%s result", entry.getKey())
                    .isEqualTo(expectedResult);
            assertThat(trace.events().stream().map(SortingRegressionFixturesTests::signature))
                    .as("%s visible trace", entry.getKey())
                    .containsExactlyElementsOf(expectedEvents);
        }
    }

    private static Map<String, SortingAlgorithm<?>> algorithms() {
        Map<String, SortingAlgorithm<?>> algorithms = new LinkedHashMap<>();
        algorithms.put("insertion", new InsertionSortAlgorithm());
        algorithms.put("selection", new SelectionSortAlgorithm());
        algorithms.put("bubble", new BubbleSortAlgorithm());
        algorithms.put("merge", new MergeSortAlgorithm());
        algorithms.put("quick", new QuickSortAlgorithm());
        algorithms.put("heap", new HeapSortAlgorithm());
        return algorithms;
    }

    private static String signature(SemanticEvent<?> event) {
        String values = event.state().stream()
                .map(TraceItem::value)
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        String ranges = event.sortedRanges().stream()
                .map(SortingRegressionFixturesTests::range)
                .collect(Collectors.joining(","));
        return "%s|%s|%s|%s".formatted(
                event.type(), event.pseudocodeLineId(), values, ranges);
    }

    private static String range(SortedRange range) {
        return range.fromIndex() + "-" + range.throughIndex();
    }

    private static List<Integer> integers(JsonNode array) {
        return StreamSupport.stream(array.spliterator(), false)
                .map(JsonNode::asInt)
                .toList();
    }
}
