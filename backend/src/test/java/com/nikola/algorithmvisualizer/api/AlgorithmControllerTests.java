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
    void returnsInsertionSortEventTrace() throws Exception {
        mockMvc.perform(post("/api/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[3,1,2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm").value("Insertion Sort"))
                .andExpect(jsonPath("$.sortedValues[0]").value(1))
                .andExpect(jsonPath("$.comparisons").value(3))
                .andExpect(jsonPath("$.swaps").value(2))
                .andExpect(jsonPath("$.events.length()").value(7))
                .andExpect(jsonPath("$.events[0].pseudocodeLineId").value("compare-adjacent"))
                .andExpect(jsonPath("$.events[0].comparisonResult").value("GREATER"))
                .andExpect(jsonPath("$.events[2].type").value("PASS_COMPLETE"));
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
        mockMvc.perform(post("/api/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem:invalid-input"))
                .andExpect(jsonPath("$.title").value("Invalid input"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").isNotEmpty())
                .andExpect(jsonPath("$.instance").value("/api/algorithms/insertion-sort"))
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    @Test
    void acceptsMaximumInputSize() throws Exception {
        String values = java.util.stream.IntStream.range(0, 50)
                .mapToObj(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));

        mockMvc.perform(post("/api/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"values\":[" + values + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sortedValues.length()").value(50));
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
        mockMvc.perform(post("/api/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    private void expectMalformed(String body) throws Exception {
        mockMvc.perform(post("/api/algorithms/insertion-sort")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem:malformed-request"))
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }
}
