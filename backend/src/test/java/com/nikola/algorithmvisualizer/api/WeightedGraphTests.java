package com.nikola.algorithmvisualizer.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class WeightedGraphTests {
    @Autowired
    private MockMvc mockMvc;

    private String request(String edges) {
        return "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\",\"B\",\"C\"],\"edges\":["
                + edges + "],\"startNode\":\"A\"}";
    }

    @Test
    void advertisesOptionalWeightedInputAndBounds() throws Exception {
        mockMvc.perform(get("/api/v2/algorithms"))
                .andExpect(jsonPath("$[7].constraints.weighted").value(true))
                .andExpect(jsonPath("$[7].constraints.minimumWeight").value(1))
                .andExpect(jsonPath("$[7].constraints.maximumWeight").value(99));
    }

    @Test
    void preservesAuthoredWeightsAndLeavesUnweightedEdgesWithoutAWeightField() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                        .content(request("""
                                {"from":"A","to":"B","weight":99},
                                {"from":"A","to":"C","weight":1},
                                {"from":"B","to":"C"}
                                """)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.edges[0].weight").value(99))
                .andExpect(jsonPath("$.input.edges[1].weight").value(1))
                .andExpect(jsonPath("$.input.edges[2].weight").doesNotHaveJsonPath())
                .andExpect(jsonPath("$.result.traversalOrder[1]").value("B"))
                .andExpect(jsonPath("$.result.parents.C").value("A"));
    }

    @Test
    void weightsDoNotChangeAnyBfsEventsOrResults() throws Exception {
        String edges = "{\"from\":\"A\",\"to\":\"B\"},{\"from\":\"A\",\"to\":\"C\"},{\"from\":\"B\",\"to\":\"C\"}";
        var mapper = new ObjectMapper();
        var unweighted = mapper.readTree(mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                .contentType(MediaType.APPLICATION_JSON).content(request(edges)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        var weighted = mapper.readTree(mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                .contentType(MediaType.APPLICATION_JSON).content(request(edges.replace("}", ",\"weight\":99}"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(weighted.path("events")).isEqualTo(unweighted.path("events"));
        assertThat(weighted.path("result")).isEqualTo(unweighted.path("result"));
    }

    @Test
    void weightsDoNotChangeAnyDfsEventsOrResults() throws Exception {
        String edges = "{\"from\":\"A\",\"to\":\"B\"},{\"from\":\"A\",\"to\":\"C\"},{\"from\":\"B\",\"to\":\"C\"}";
        var mapper = new ObjectMapper();
        var unweighted = mapper.readTree(mockMvc.perform(post("/api/v2/algorithms/dfs/trace")
                .contentType(MediaType.APPLICATION_JSON).content(request(edges)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        var weighted = mapper.readTree(mockMvc.perform(post("/api/v2/algorithms/dfs/trace")
                .contentType(MediaType.APPLICATION_JSON).content(request(edges.replace("}", ",\"weight\":99}"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(weighted.path("events")).isEqualTo(unweighted.path("events"));
        assertThat(weighted.path("result")).isEqualTo(unweighted.path("result"));
    }

    @Test
    void rejectsOutOfRangeWeightsWithAnExactField() throws Exception {
        for (int weight : new int[] { -1, 0, 100 }) {
            mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                            .content(request("{\"from\":\"A\",\"to\":\"B\",\"weight\":" + weight + "}")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                    .andExpect(jsonPath("$.field").value("edges[0].weight"))
                    .andExpect(jsonPath("$.detail").value("Edge 1: weight must be an integer from 1 through 99"));
        }
    }

    @Test
    void rejectsMalformedWeightsThroughProblemDetails() throws Exception {
        for (String weight : new String[] { "1.5", "1.0", "2147483648", "null", "\"7\"", "\"invalid\"", "true", "{}", "[]" }) {
            mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                            .content(request("{\"from\":\"A\",\"to\":\"B\",\"weight\":" + weight + "}")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
        }
    }

    @Test
    void independentlyEnforcesNodeAndEdgeCountLimits() throws Exception {
        String edge = "{\"from\":\"A\",\"to\":\"B\",\"weight\":7}";
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                        .content(request(String.join(",", java.util.Collections.nCopies(67, edge)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("edges"));
        String nodes = java.util.stream.IntStream.range(0, 13).mapToObj(i -> "\"N" + i + "\"")
                .collect(java.util.stream.Collectors.joining(","));
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[" + nodes + "],\"edges\":[],\"startNode\":\"N0\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("nodes"));
    }

    @Test
    void rejectsWeightedDuplicatesAndInvalidEndpoints() throws Exception {
        for (String second : new String[] { "{\"from\":\"B\",\"to\":\"A\",\"weight\":99}",
                "{\"from\":\"A\",\"to\":\"B\"}" }) {
            mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                            .content(request("{\"from\":\"A\",\"to\":\"B\",\"weight\":1}," + second)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.field").value("edges[1]"))
                    .andExpect(jsonPath("$.detail").value("Edge 2: duplicate edge; first declared as edge 1"));
        }
        for (String edge : new String[] { "{\"from\":\"A\",\"to\":\"A\",\"weight\":7}",
                "{\"from\":\"A\",\"to\":\"Z\",\"weight\":7}", "null" }) {
            mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                            .content(request(edge)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                    .andExpect(jsonPath("$.field").value("edges[0]"));
        }
    }
}
