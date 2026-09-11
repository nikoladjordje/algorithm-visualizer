package com.nikola.algorithmvisualizer.contract;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.StreamSupport;

import org.junit.jupiter.api.Test;

import com.nikola.algorithmvisualizer.graph.BreadthFirstSearchAlgorithm;
import com.nikola.algorithmvisualizer.graph.DijkstraPathfindingAlgorithm;
import com.nikola.algorithmvisualizer.graph.IterativeDepthFirstSearchAlgorithm;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class GraphRegressionFixturesTests {

    private static final String FIXTURE = "contracts/v2/graph-regression-traces.json";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Test
    void locksRepresentativeGraphResultsAndSemanticStepOrdering() throws IOException {
        JsonNode fixtures = V2ContractFixturesTests.readFixture(FIXTURE);

        for (String name : List.of("unweightedBfs", "iterativeDfs", "targetedBfs",
                "dijkstraSuccess", "dijkstraTie", "dijkstraNoPath")) {
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
        JsonNode request = fixture.path("request");
        List<String> nodes = textValues(request.path("nodes"));
        String start = request.path("startNode").asText();
        String destination = request.path("destination").isMissingNode()
                ? null : request.path("destination").asText();

        return switch (fixture.path("algorithm").asText()) {
            case "bfs" -> {
                var edges = StreamSupport.stream(request.path("edges").spliterator(), false)
                        .map(edge -> new BreadthFirstSearchAlgorithm.Edge(
                                edge.path("from").asText(), edge.path("to").asText()))
                        .toList();
                var trace = new BreadthFirstSearchAlgorithm().execute(nodes, edges, start, destination);
                yield new ActualTrace(OBJECT_MAPPER.valueToTree(trace.result()),
                        trace.events().stream().map(event -> event.type() + "|" + event.pseudocodeLineId()).toList(),
                        trace.events().stream().map(BreadthFirstSearchAlgorithm.Event::sequence).toList());
            }
            case "dfs" -> {
                var edges = StreamSupport.stream(request.path("edges").spliterator(), false)
                        .map(edge -> new IterativeDepthFirstSearchAlgorithm.Edge(
                                edge.path("from").asText(), edge.path("to").asText()))
                        .toList();
                var trace = new IterativeDepthFirstSearchAlgorithm().execute(nodes, edges, start);
                yield new ActualTrace(OBJECT_MAPPER.valueToTree(trace.result()),
                        trace.events().stream().map(event -> event.type() + "|" + event.pseudocodeLineId()).toList(),
                        trace.events().stream().map(IterativeDepthFirstSearchAlgorithm.Event::sequence).toList());
            }
            case "dijkstra" -> {
                var edges = StreamSupport.stream(request.path("edges").spliterator(), false)
                        .map(edge -> new DijkstraPathfindingAlgorithm.Edge(
                                edge.path("from").asText(), edge.path("to").asText(),
                                edge.path("weight").isMissingNode() ? 1 : edge.path("weight").asInt()))
                        .toList();
                var trace = new DijkstraPathfindingAlgorithm().execute(nodes, edges, start, destination);
                yield new ActualTrace(OBJECT_MAPPER.valueToTree(trace.result()),
                        trace.events().stream().map(event -> event.type() + "|" + event.pseudocodeLineId()).toList(),
                        trace.events().stream().map(DijkstraPathfindingAlgorithm.Event::sequence).toList());
            }
            default -> throw new IllegalArgumentException("Unsupported fixture algorithm");
        };
    }

    private static List<String> textValues(JsonNode array) {
        return StreamSupport.stream(array.spliterator(), false).map(JsonNode::asText).toList();
    }

    private record ActualTrace(JsonNode result, List<String> events, List<Integer> sequences) { }
}
