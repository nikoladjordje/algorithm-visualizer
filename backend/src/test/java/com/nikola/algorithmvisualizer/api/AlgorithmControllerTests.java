package com.nikola.algorithmvisualizer.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AlgorithmControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void advertisesAllSortingAlgorithmsThroughTheV2SortingContract() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7))
                .andExpect(jsonPath("$[0].id").value("insertion"))
                .andExpect(jsonPath("$[1].id").value("selection"))
                .andExpect(jsonPath("$[2].id").value("bubble"))
                .andExpect(jsonPath("$[3].id").value("merge"))
                .andExpect(jsonPath("$[4].id").value("quick"))
                .andExpect(jsonPath("$[5].id").value("heap"))
                .andExpect(jsonPath("$[0].family").value("SORTING"))
                .andExpect(jsonPath("$[0].contractVersion").value("2.0"))
                .andExpect(jsonPath("$[0].constraints.kind").value("SORTING"))
                .andExpect(jsonPath("$[0].constraints.minimumValues").value(1))
                .andExpect(jsonPath("$[0].constraints.maximumValues").value(50));
    }

    @Test
    void executesEverySortingAlgorithmThroughTheV2TraceRoute() throws Exception {
        for (String algorithmId : java.util.List.of("insertion", "selection", "bubble", "merge", "quick", "heap")) {
            mockMvc.perform(post("/api/v2/algorithms/{algorithmId}/trace", algorithmId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"kind\":\"SORTING\",\"values\":[3,1,2]}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.algorithm.id").value(algorithmId))
                    .andExpect(jsonPath("$.algorithm.family").value("SORTING"))
                    .andExpect(jsonPath("$.result.values[0]").value(1))
                    .andExpect(jsonPath("$.result.values[2]").value(3))
                    .andExpect(jsonPath("$.events[0].state.kind").value("SORTING"))
                    .andExpect(jsonPath("$.events[0].data.kind").value(
                            org.hamcrest.Matchers.not(org.hamcrest.Matchers.emptyString())));
        }
    }

    @Test
    void runsSingleNodeBreadthFirstSearchThroughV2() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7))
                .andExpect(jsonPath("$[6].id").value("bfs"))
                .andExpect(jsonPath("$[6].family").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$[6].constraints.kind").value("GRAPH_TRAVERSAL"));

        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[],\"startNode\":\"A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm.family").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$.input.kind").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$.result.traversalOrder[0]").value("A"))
                .andExpect(jsonPath("$.result.parents").isEmpty())
                .andExpect(jsonPath("$.result.unreachableNodes").isEmpty())
                .andExpect(jsonPath("$.result.visitedNodeCount").value(1))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(0))
                .andExpect(jsonPath("$.result.maximumQueueSize").value(1))
                .andExpect(jsonPath("$.events.length()").value(4))
                .andExpect(jsonPath("$.events[0].type").value("TRAVERSAL_INITIALIZED"))
                .andExpect(jsonPath("$.events[0].state.nodeStatuses.A").value("DISCOVERED"))
                .andExpect(jsonPath("$.events[1].type").value("NODE_DEQUEUED"))
                .andExpect(jsonPath("$.events[1].state.nodeStatuses.A").value("ACTIVE"))
                .andExpect(jsonPath("$.events[2].type").value("NODE_COMPLETED"))
                .andExpect(jsonPath("$.events[2].state.nodeStatuses.A").value("PROCESSED"))
                .andExpect(jsonPath("$.events[3].type").value("TRAVERSAL_COMPLETED"));
    }

    @Test
    void returnsInsertionSortThroughTheDiscriminatedV2Trace() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"SORTING\",\"values\":[3,1,2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apiVersion").value("2.0"))
                .andExpect(jsonPath("$.algorithm.family").value("SORTING"))
                .andExpect(jsonPath("$.input.kind").value("SORTING"))
                .andExpect(jsonPath("$.input.values[0]").value(3))
                .andExpect(jsonPath("$.result.kind").value("SORTING"))
                .andExpect(jsonPath("$.result.values[0]").value(1))
                .andExpect(jsonPath("$.limits.maximumEvents").value(10000))
                .andExpect(jsonPath("$.events[0].sequence").value(1))
                .andExpect(jsonPath("$.events[0].type").value("SELECT"))
                .andExpect(jsonPath("$.events[0].state.kind").value("SORTING"))
                .andExpect(jsonPath("$.events[0].state.items[0].value").value(3))
                .andExpect(jsonPath("$.events[0].data.kind").value("SELECT"))
                .andExpect(jsonPath("$.events[0].data.index").value(1));
    }

    @Test
    void rejectsAMismatchedV2RequestKindWithProblemDetails() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"values\":[1]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem:algorithm-family-mismatch"))
                .andExpect(jsonPath("$.code").value("ALGORITHM_FAMILY_MISMATCH"))
                .andExpect(jsonPath("$.field").value("kind"));
    }

    @Test
    void removedInsertionCompatibilityRoutesReturnNotFound() throws Exception {
        mockMvc.perform(post("/api/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[3,1,2]}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/v1/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[3,1,2]}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returnsVersionedSemanticEventTrace() throws Exception {
        mockMvc.perform(post("/api/v1/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[3,1,2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apiVersion").value("1.0"))
                .andExpect(jsonPath("$.algorithm.id").value("insertion"))
                .andExpect(jsonPath("$.summary.resultValues[0]").value(1))
                .andExpect(jsonPath("$.summary.eventCount").value(16))
                .andExpect(jsonPath("$.summary.operationCounts.COMPARE").value(3))
                .andExpect(jsonPath("$.limits.maxInputItems").value(50))
                .andExpect(jsonPath("$.limits.maxEvents").value(10000))
                .andExpect(jsonPath("$.events[0].sequence").value(1))
                .andExpect(jsonPath("$.events[0].type").value("SELECT"))
                .andExpect(jsonPath("$.events[0].data.index").value(1));
    }

    @Test
    void discoversCatalogInExplicitOrderAndRejectsUnknownAlgorithms() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("insertion"))
                .andExpect(jsonPath("$[1].id").value("selection"))
                .andExpect(jsonPath("$[5].id").value("heap"))
                .andExpect(jsonPath("$[0].contractVersion").value("1.0"));
        mockMvc.perform(post("/api/v1/algorithms/missing/trace").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[1]}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("ALGORITHM_NOT_FOUND"));
    }

    @Test
    void rejectsEmptyInput() throws Exception {
        mockMvc.perform(post("/api/v1/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem:invalid-input"))
                .andExpect(jsonPath("$.title").value("Invalid input"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").isNotEmpty())
                .andExpect(jsonPath("$.instance").value("/api/v1/algorithms/insertion/trace"))
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    @Test
    void acceptsMaximumInputSize() throws Exception {
        String values = java.util.stream.IntStream.range(0, 50)
                .mapToObj(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));

        mockMvc.perform(post("/api/v1/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[" + values + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.resultValues.length()").value(50));
    }

    @Test
    void rejectsMoreThanMaximumInputSize() throws Exception {
        String values = java.util.stream.IntStream.range(0, 51)
                .mapToObj(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));

        expectInvalidInput("{\"values\":[" + values + "]}");
    }

    @Test
    void rejectsMissingNullAndNullElementValues() throws Exception {
        expectInvalidInput("{}");
        expectInvalidInput("{\"values\":null}");
        expectInvalidInput("{\"values\":[1,null,2]}");
    }

    @Test
    void rejectsMalformedJsonAndWrongValueTypes() throws Exception {
        expectMalformed("{\"values\":[1,}");
        expectMalformed("{\"values\":[1,\"two\"]}");
        expectMalformed("{\"values\":[1,2.5]}");
        expectMalformed("{\"values\":[2147483648]}");
    }

    private void expectInvalidInput(String body) throws Exception {
        mockMvc.perform(post("/api/v1/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    private void expectMalformed(String body) throws Exception {
        mockMvc.perform(post("/api/v1/algorithms/insertion/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem:malformed-request"))
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }
}
