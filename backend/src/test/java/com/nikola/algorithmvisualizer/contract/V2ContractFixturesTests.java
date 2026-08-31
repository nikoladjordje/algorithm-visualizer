package com.nikola.algorithmvisualizer.contract;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.StreamSupport;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class V2ContractFixturesTests {

    private static final String CONTRACT_FIXTURE = "contracts/v2/contract-fixtures.json";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Test
    void usesNormativeFamilyAndKindDiscriminators() throws IOException {
        JsonNode fixture = readFixture(CONTRACT_FIXTURE);

        assertThat(textValues(fixture.path("catalog"), "family"))
                .containsExactly("SORTING", "GRAPH_TRAVERSAL");
        assertThat(textValues(fixture.path("catalog"), "contractVersion"))
                .containsOnly("2.0");
        assertThat(fixture.at("/requests/sorting/kind").asText()).isEqualTo("SORTING");
        assertThat(fixture.at("/requests/graphTraversal/kind").asText()).isEqualTo("GRAPH_TRAVERSAL");
        assertThat(fixture.at("/results/sorting/kind").asText()).isEqualTo("SORTING");
        assertThat(fixture.at("/results/graphTraversal/kind").asText()).isEqualTo("GRAPH_TRAVERSAL");
        assertThat(fixture.at("/states/sorting/kind").asText()).isEqualTo("SORTING");
        assertThat(fixture.at("/states/graphTraversal/kind").asText()).isEqualTo("GRAPH_TRAVERSAL");

        assertEventDiscriminators(fixture.path("events").path("sorting"), "COMPARE", "SORTING");
        assertEventDiscriminators(
                fixture.path("events").path("graphTraversal"), "NODE_DISCOVERED", "GRAPH_TRAVERSAL");
    }

    @Test
    void keepsFamilyConstraintsAsSeparateShapes() throws IOException {
        JsonNode catalog = readFixture(CONTRACT_FIXTURE).path("catalog");
        JsonNode sorting = catalog.get(0).path("constraints");
        JsonNode graph = catalog.get(1).path("constraints");

        assertThat(fieldNames(sorting)).containsExactlyInAnyOrder(
                "kind", "minimumValues", "maximumValues", "minimumValue", "maximumValue");
        assertThat(fieldNames(graph)).containsExactlyInAnyOrder(
                "kind", "minimumNodes", "maximumNodes", "maximumEdges",
                "nodeLabelPattern", "directed", "weighted");
        assertThat(fieldNames(sorting)).doesNotContainAnyElementsOf(fieldNames(graph).stream()
                .filter(field -> !field.equals("kind"))
                .toList());
    }

    @Test
    void locksProblemDetailsAndRouteLifecycle() throws IOException {
        JsonNode fixture = readFixture(CONTRACT_FIXTURE);
        JsonNode problem = fixture.path("problemDetails");

        assertThat(fieldNames(problem)).containsExactlyInAnyOrder(
                "type", "title", "status", "detail", "instance", "code", "field");
        assertThat(problem.path("code").asText()).isEqualTo("ALGORITHM_FAMILY_MISMATCH");
        assertThat(problem.path("status").asInt()).isEqualTo(400);
        assertThat(problem.path("instance").asText())
                .isEqualTo("/api/v2/algorithms/insertion/trace");

        assertThat(values(fixture.at("/routeLifecycle/preservedV1"))).containsExactly(
                "GET /api/v1/algorithms",
                "POST /api/v1/algorithms/{algorithmId}/trace");
        assertThat(values(fixture.at("/routeLifecycle/removedCompatibility"))).containsExactly(
                "POST /api/algorithms/insertion-sort",
                "POST /api/v1/algorithms/insertion-sort");
        assertThat(values(fixture.at("/routeLifecycle/v2"))).containsExactly(
                "GET /api/v2/algorithms",
                "POST /api/v2/algorithms/{algorithmId}/trace");
    }

    private static void assertEventDiscriminators(JsonNode event, String type, String stateKind) {
        assertThat(event.path("type").asText()).isEqualTo(type);
        assertThat(event.path("data").path("kind").asText()).isEqualTo(type);
        assertThat(event.path("state").path("kind").asText()).isEqualTo(stateKind);
        assertThat(event.path("sequence").asInt()).isPositive();
        assertThat(event.path("pseudocodeLineId").asText()).isNotBlank();
    }

    private static Set<String> fieldNames(JsonNode node) {
        Set<String> names = new LinkedHashSet<>();
        names.addAll(node.propertyNames());
        return names;
    }

    private static List<String> textValues(JsonNode array, String field) {
        return StreamSupport.stream(array.spliterator(), false)
                .map(item -> item.path(field).asText())
                .toList();
    }

    private static List<String> values(JsonNode array) {
        return StreamSupport.stream(array.spliterator(), false)
                .map(JsonNode::asText)
                .toList();
    }

    static JsonNode readFixture(String name) throws IOException {
        try (InputStream stream = V2ContractFixturesTests.class.getClassLoader().getResourceAsStream(name)) {
            assertThat(stream).as("fixture %s", name).isNotNull();
            return OBJECT_MAPPER.readTree(stream);
        }
    }
}
