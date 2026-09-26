package com.nikola.algorithmvisualizer.contract;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.StreamSupport;

import org.junit.jupiter.api.Test;

import com.nikola.algorithmvisualizer.search.BinarySearchAlgorithm;
import com.nikola.algorithmvisualizer.search.LinearSearchAlgorithm;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class SearchRegressionFixturesTests {

    private static final String FIXTURE = "contracts/v2/search-regression-traces.json";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Test
    void locksRepresentativeSearchResultsAndSemanticStepOrdering() throws IOException {
        JsonNode fixtures = V2ContractFixturesTests.readFixture(FIXTURE);

        for (String name : List.of("linearEmpty", "linearFound", "binaryDuplicate", "binaryNotFound")) {
            JsonNode fixture = fixtures.path(name);
            ActualTrace actual = execute(fixture);

            assertThat(actual.result()).as("%s result", name).isEqualTo(fixture.path("result"));
            assertThat(actual.events()).as("%s semantic trace", name)
                    .containsExactlyElementsOf(textValues(fixture.path("events")));
            assertThat(actual.sequences()).as("%s sequence", name)
                    .containsExactlyElementsOf(IntStream.rangeClosed(1, actual.events().size())
                            .boxed().toList());
        }
    }

    private static ActualTrace execute(JsonNode fixture) {
        List<Integer> values = StreamSupport.stream(fixture.path("request").path("values").spliterator(), false)
                .map(JsonNode::asInt).toList();
        int target = fixture.path("request").path("target").asInt();

        return switch (fixture.path("algorithm").asText()) {
            case "linear-search" -> {
                var trace = new LinearSearchAlgorithm().execute(values, target);
                yield new ActualTrace(OBJECT_MAPPER.valueToTree(trace.result()), trace.events().stream()
                        .map(event -> event.type() + "|" + event.pseudocodeLineId()).toList(), trace.events().stream()
                        .map(LinearSearchAlgorithm.Event::sequence).toList());
            }
            case "binary-search" -> {
                var trace = new BinarySearchAlgorithm().execute(values, target);
                yield new ActualTrace(OBJECT_MAPPER.valueToTree(trace.result()), trace.events().stream()
                        .map(event -> event.type() + "|" + event.pseudocodeLineId()).toList(), trace.events().stream()
                        .map(BinarySearchAlgorithm.Event::sequence).toList());
            }
            default -> throw new IllegalArgumentException("Unsupported fixture algorithm");
        };
    }

    private static List<String> textValues(JsonNode array) {
        return StreamSupport.stream(array.spliterator(), false).map(JsonNode::asText).toList();
    }

    private record ActualTrace(JsonNode result, List<String> events, List<Integer> sequences) { }
}
