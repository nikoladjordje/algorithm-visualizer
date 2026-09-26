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
    void advertisesAndRunsBinarySearchTreePreorderThroughTheTreeContract() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[-1].id").value("binary-search-tree"))
                .andExpect(jsonPath("$[-1].family").value("TREE"))
                .andExpect(jsonPath("$[-1].constraints.minimumValues").value(1))
                .andExpect(jsonPath("$[-1].constraints.maximumValues").value(31))
                .andExpect(jsonPath("$[-1].constraints.uniqueValues").value(true));

        mockMvc.perform(post("/api/v2/algorithms/binary-search-tree/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"TREE\",\"insertionValues\":[8,3,10,1,6],\"operation\":{\"kind\":\"PREORDER\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm.family").value("TREE"))
                .andExpect(jsonPath("$.input.insertionValues[1]").value(3))
                .andExpect(jsonPath("$.result.kind").value("PREORDER"))
                .andExpect(jsonPath("$.result.visitedValues[0]").value(8))
                .andExpect(jsonPath("$.result.visitedValues[4]").value(10))
                .andExpect(jsonPath("$.events[1].state.rootId").value(1))
                .andExpect(jsonPath("$.events[-1].type").value("OPERATION_COMPLETED"));

        mockMvc.perform(post("/api/v2/algorithms/binary-search-tree/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"TREE\",\"insertionValues\":[8,3,8],\"operation\":{\"kind\":\"PREORDER\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("insertionValues[2]"));
    }

    @Test
    void runsLinearSearchWithSeparateSelectionAndComparisonSteps() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/linear-search/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"SEARCH\",\"values\":[4,-2,4],\"target\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm.family").value("SEARCH"))
                .andExpect(jsonPath("$.input.values[1]").value(-2))
                .andExpect(jsonPath("$.result.found").value(true))
                .andExpect(jsonPath("$.result.foundIndex").value(0))
                .andExpect(jsonPath("$.result.comparisons").value(1))
                .andExpect(jsonPath("$.events[1].type").value("CANDIDATE_SELECTED"))
                .andExpect(jsonPath("$.events[2].type").value("TARGET_COMPARED"))
                .andExpect(jsonPath("$.events[3].type").value("SEARCH_FOUND"));
    }

    @Test
    void rejectsALinearSearchRequestFromAnotherFamily() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/linear-search/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"SORTING\",\"values\":[4],\"target\":4}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ALGORITHM_FAMILY_MISMATCH"));
    }

    @Test
    void runsBinarySearchWithInclusiveIntervalsAndRejectsAnInversion() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[7].id").value("binary-search"))
                .andExpect(jsonPath("$[7].constraints.requiresNonDecreasingValues").value(true));

        mockMvc.perform(post("/api/v2/algorithms/binary-search/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"SEARCH\",\"values\":[1,3,5,7],\"target\":7}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.foundIndex").value(3))
                .andExpect(jsonPath("$.events[0].state.lowerBound").value(0))
                .andExpect(jsonPath("$.events[0].state.upperBound").value(3))
                .andExpect(jsonPath("$.events[3].type").value("SEARCH_INTERVAL_NARROWED"))
                .andExpect(jsonPath("$.events[3].state.lowerBound").value(2));

        mockMvc.perform(post("/api/v2/algorithms/binary-search/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"SEARCH\",\"values\":[1,5,3],\"target\":3}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("values[2]"));
    }

    @Test
    void advertisesAllSortingAlgorithmsThroughTheV2SortingContract() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12))
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
                .andExpect(jsonPath("$.length()").value(12))
                .andExpect(jsonPath("$[8].id").value("bfs"))
                .andExpect(jsonPath("$[8].family").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$[8].constraints.kind").value("GRAPH_TRAVERSAL"));

        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[],\"startNode\":\"A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm.family").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$.input.kind").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$.input.destination").doesNotExist())
                .andExpect(jsonPath("$.result.traversalOrder[0]").value("A"))
                .andExpect(jsonPath("$.result.parents").isEmpty())
                .andExpect(jsonPath("$.result.unreachableNodes").isEmpty())
                .andExpect(jsonPath("$.result.visitedNodeCount").value(1))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(0))
                .andExpect(jsonPath("$.result.maximumQueueSize").value(1))
                .andExpect(jsonPath("$.result.pathFound").doesNotExist())
                .andExpect(jsonPath("$.result.path").doesNotExist())
                .andExpect(jsonPath("$.result.unexploredNodes").doesNotExist())
                .andExpect(jsonPath("$.events.length()").value(4))
                .andExpect(jsonPath("$.events[0].type").value("TRAVERSAL_INITIALIZED"))
                .andExpect(jsonPath("$.events[0].state.nodeStatuses.A").value("DISCOVERED"))
                .andExpect(jsonPath("$.events[0].state.selectedPath").doesNotExist())
                .andExpect(jsonPath("$.events[1].type").value("NODE_DEQUEUED"))
                .andExpect(jsonPath("$.events[1].state.nodeStatuses.A").value("ACTIVE"))
                .andExpect(jsonPath("$.events[2].type").value("NODE_COMPLETED"))
                .andExpect(jsonPath("$.events[2].state.nodeStatuses.A").value("PROCESSED"))
                .andExpect(jsonPath("$.events[3].type").value("TRAVERSAL_COMPLETED"));
    }

    @Test
    void runsSingleNodeIterativeDepthFirstSearchThroughV2() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12))
                .andExpect(jsonPath("$[9].id").value("dfs"))
                .andExpect(jsonPath("$[9].family").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$[9].constraints.kind").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$[9].constraints.maximumNodes").value(12))
                .andExpect(jsonPath("$[9].constraints.maximumEdges").value(66));

        mockMvc.perform(post("/api/v2/algorithms/dfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[],\"startNode\":\"A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm.id").value("dfs"))
                .andExpect(jsonPath("$.algorithm.family").value("GRAPH_TRAVERSAL"))
                .andExpect(jsonPath("$.input.destination").doesNotExist())
                .andExpect(jsonPath("$.result.traversalOrder[0]").value("A"))
                .andExpect(jsonPath("$.result.parents").isEmpty())
                .andExpect(jsonPath("$.result.unreachableNodes").isEmpty())
                .andExpect(jsonPath("$.result.visitedNodeCount").value(1))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(0))
                .andExpect(jsonPath("$.result.maximumStackSize").value(1))
                .andExpect(jsonPath("$.result.maximumQueueSize").doesNotExist())
                .andExpect(jsonPath("$.events.length()").value(4))
                .andExpect(jsonPath("$.events[0].sequence").value(1))
                .andExpect(jsonPath("$.events[0].type").value("TRAVERSAL_INITIALIZED"))
                .andExpect(jsonPath("$.events[0].state.nodeStatuses.A").value("DISCOVERED"))
                .andExpect(jsonPath("$.events[0].state.stack[0]").value("A"))
                .andExpect(jsonPath("$.events[1].sequence").value(2))
                .andExpect(jsonPath("$.events[1].type").value("NODE_POPPED"))
                .andExpect(jsonPath("$.events[1].state.nodeStatuses.A").value("ACTIVE"))
                .andExpect(jsonPath("$.events[1].state.stack").isEmpty())
                .andExpect(jsonPath("$.events[2].sequence").value(3))
                .andExpect(jsonPath("$.events[2].type").value("NODE_COMPLETED"))
                .andExpect(jsonPath("$.events[2].state.nodeStatuses.A").value("PROCESSED"))
                .andExpect(jsonPath("$.events[3].sequence").value(4))
                .andExpect(jsonPath("$.events[3].type").value("TRAVERSAL_COMPLETED"));
    }

    @Test
    void runsConnectedAndDisconnectedDepthFirstSearchThroughV2() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/dfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"kind":"GRAPH_TRAVERSAL","nodes":["A","C","B","D","Z"],
                                 "edges":[{"from":"B","to":"D","weight":99},
                                          {"from":"A","to":"B"},{"from":"C","to":"D"},
                                          {"from":"A","to":"C","weight":1}],
                                 "startNode":"A"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.edges[0].weight").value(99))
                .andExpect(jsonPath("$.result.traversalOrder[0]").value("A"))
                .andExpect(jsonPath("$.result.traversalOrder[1]").value("C"))
                .andExpect(jsonPath("$.result.traversalOrder[2]").value("D"))
                .andExpect(jsonPath("$.result.traversalOrder[3]").value("B"))
                .andExpect(jsonPath("$.result.parents.C").value("A"))
                .andExpect(jsonPath("$.result.parents.D").value("C"))
                .andExpect(jsonPath("$.result.unreachableNodes[0]").value("Z"))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(8))
                .andExpect(jsonPath("$.result.maximumStackSize").value(2))
                .andExpect(jsonPath("$.events[2].type").value("EDGE_EXAMINED"))
                .andExpect(jsonPath("$.events[3].type").value("NODE_DISCOVERED"))
                .andExpect(jsonPath("$.events[3].state.examinedEdge.to").value("B"));

        mockMvc.perform(post("/api/v2/algorithms/dfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"SORTING\",\"values\":[1]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ALGORITHM_FAMILY_MISMATCH"));
    }

    @Test
    void runsConnectedBreadthFirstSearchThroughV2() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"kind":"GRAPH_TRAVERSAL","nodes":["A","C","B","D"],
                                 "edges":[{"from":"A","to":"B"},{"from":"A","to":"C"},
                                          {"from":"C","to":"D"},{"from":"B","to":"D"}],
                                 "startNode":"A"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.edges.length()").value(4))
                .andExpect(jsonPath("$.result.traversalOrder[0]").value("A"))
                .andExpect(jsonPath("$.result.traversalOrder[1]").value("C"))
                .andExpect(jsonPath("$.result.traversalOrder[2]").value("B"))
                .andExpect(jsonPath("$.result.parents.D").value("C"))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(8))
                .andExpect(jsonPath("$.events[2].type").value("EDGE_EXAMINED"))
                .andExpect(jsonPath("$.events[2].state.examinedEdge.to").value("C"))
                .andExpect(jsonPath("$.events[3].type").value("NODE_DISCOVERED"))
                .andExpect(jsonPath("$.events[3].data.parent").value("A"));
    }

    @Test
    void findsAFewestEdgePathAndStopsWhenTheDestinationIsDequeued() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"kind":"GRAPH_TRAVERSAL","nodes":["A","B","C","D","E"],
                                 "edges":[{"from":"A","to":"B","weight":99},
                                          {"from":"A","to":"C"},{"from":"B","to":"D"},
                                          {"from":"C","to":"E"}],
                                 "startNode":"A","destination":"B"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.destination").value("B"))
                .andExpect(jsonPath("$.result.pathFound").value(true))
                .andExpect(jsonPath("$.result.path[0]").value("A"))
                .andExpect(jsonPath("$.result.path[1]").value("B"))
                .andExpect(jsonPath("$.result.pathEdgeCount").value(1))
                .andExpect(jsonPath("$.result.unreachableNodes").isEmpty())
                .andExpect(jsonPath("$.result.unexploredNodes[0]").value("C"))
                .andExpect(jsonPath("$.result.unexploredNodes[1]").value("D"))
                .andExpect(jsonPath("$.result.unexploredNodes[2]").value("E"))
                .andExpect(jsonPath("$.result.visitedNodeCount").value(2))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(2))
                .andExpect(jsonPath("$.events[-1].type").value("PATH_RECONSTRUCTED"))
                .andExpect(jsonPath("$.events[-1].pseudocodeLineId").value("bfs-reconstruct-path"))
                .andExpect(jsonPath("$.events[-1].state.selectedPath[0]").value("A"))
                .andExpect(jsonPath("$.events[-1].state.selectedPath[1]").value("B"))
                .andExpect(jsonPath("$.events[-1].data.pathFound").value(true));
    }

    @Test
    void reportsValidTargetedBoundaryAndNoPathOutcomes() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"kind":"GRAPH_TRAVERSAL","nodes":["A","B"],
                                 "edges":[{"from":"A","to":"B"}],
                                 "startNode":"A","destination":"A"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.pathFound").value(true))
                .andExpect(jsonPath("$.result.path[0]").value("A"))
                .andExpect(jsonPath("$.result.pathEdgeCount").value(0))
                .andExpect(jsonPath("$.result.edgeExaminationCount").value(0))
                .andExpect(jsonPath("$.events.length()").value(3));

        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"kind":"GRAPH_TRAVERSAL","nodes":["A","B","Z"],
                                 "edges":[{"from":"A","to":"B"}],
                                 "startNode":"A","destination":"Z"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.pathFound").value(false))
                .andExpect(jsonPath("$.result.path").isEmpty())
                .andExpect(jsonPath("$.result.pathEdgeCount").doesNotExist())
                .andExpect(jsonPath("$.result.unreachableNodes[0]").value("Z"))
                .andExpect(jsonPath("$.result.unexploredNodes").isEmpty())
                .andExpect(jsonPath("$.events[-1].type").value("PATH_RECONSTRUCTED"))
                .andExpect(jsonPath("$.events[-1].data.pathFound").value(false));
    }

    @Test
    void validatesDestinationsAndRejectsThemForDepthFirstSearch() throws Exception {
        String body = "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[],"
                + "\"startNode\":\"A\",\"destination\":\"Z\"}";
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("destination"));

        mockMvc.perform(post("/api/v2/algorithms/dfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("\"Z\"", "\"A\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("destination"));
    }

    @Test
    void advertisesAndRunsDijkstraThroughThePathfindingContract() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v2/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[10].id").value("dijkstra"))
                .andExpect(jsonPath("$[10].family").value("PATHFINDING"))
                .andExpect(jsonPath("$[10].constraints.kind").value("PATHFINDING"))
                .andExpect(jsonPath("$[10].constraints.weighted").value(true))
                .andExpect(jsonPath("$[10].constraints.minimumWeight").value(1))
                .andExpect(jsonPath("$[10].constraints.maximumWeight").value(99))
                .andExpect(jsonPath("$[10].constraints.unweightedEdgeCost").value(1))
                .andExpect(jsonPath("$[10].constraints.destinationRequired").value(true));

        mockMvc.perform(post("/api/v2/algorithms/dijkstra/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"kind":"PATHFINDING","nodes":["A","B","C","D"],
                                 "edges":[{"from":"A","to":"D","weight":9},
                                          {"from":"A","to":"B","weight":2},
                                          {"from":"B","to":"C"},
                                          {"from":"C","to":"D","weight":2}],
                                 "startNode":"A","destination":"D"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm.id").value("dijkstra"))
                .andExpect(jsonPath("$.algorithm.family").value("PATHFINDING"))
                .andExpect(jsonPath("$.input.kind").value("PATHFINDING"))
                .andExpect(jsonPath("$.input.destination").value("D"))
                .andExpect(jsonPath("$.input.edges[2].weight").doesNotExist())
                .andExpect(jsonPath("$.result.kind").value("PATHFINDING"))
                .andExpect(jsonPath("$.result.pathFound").value(true))
                .andExpect(jsonPath("$.result.path[0]").value("A"))
                .andExpect(jsonPath("$.result.path[1]").value("B"))
                .andExpect(jsonPath("$.result.path[2]").value("C"))
                .andExpect(jsonPath("$.result.path[3]").value("D"))
                .andExpect(jsonPath("$.result.totalCost").value(5))
                .andExpect(jsonPath("$.result.settledNodeCount").value(4))
                .andExpect(jsonPath("$.result.relaxationAttemptCount").value(6))
                .andExpect(jsonPath("$.events[0].type").value("PATHFINDING_INITIALIZED"))
                .andExpect(jsonPath("$.events[0].state.tentativeDistances.A").value(0))
                .andExpect(jsonPath("$.events[0].state.tentativeDistances.D").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.events[-1].type").value("PATH_RECONSTRUCTED"))
                .andExpect(jsonPath("$.events[-1].state.selectedPath[3]").value("D"));
    }

    @Test
    void validatesDijkstraDestinationAndFamilyWithoutChangingTraversalContracts() throws Exception {
        String missingDestination = """
                {"kind":"PATHFINDING","nodes":["A"],"edges":[],"startNode":"A"}
                """;
        mockMvc.perform(post("/api/v2/algorithms/dijkstra/trace")
                        .contentType(MediaType.APPLICATION_JSON).content(missingDestination))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.field").value("destination"));

        mockMvc.perform(post("/api/v2/algorithms/dijkstra/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(missingDestination.replace("}", ",\"destination\":\"Z\"}")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.field").value("destination"));

        mockMvc.perform(post("/api/v2/algorithms/dijkstra/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],"
                                + "\"edges\":[],\"startNode\":\"A\",\"destination\":\"A\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ALGORITHM_FAMILY_MISMATCH"));

        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"PATHFINDING\",\"nodes\":[\"A\"],"
                                + "\"edges\":[],\"startNode\":\"A\",\"destination\":\"A\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ALGORITHM_FAMILY_MISMATCH"));
    }

    @Test
    void rejectsInvalidGraphsWithProblemDetails() throws Exception {
        for (String body : java.util.List.of(
                "{}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[],\"edges\":[],\"startNode\":\"A\"}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\",\"A\"],\"edges\":[],\"startNode\":\"A\"}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"bad label\"],\"edges\":[],\"startNode\":\"bad label\"}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[{\"from\":\"A\",\"to\":\"A\"}],\"startNode\":\"A\"}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\",\"B\"],\"edges\":[{\"from\":\"A\",\"to\":\"B\"},{\"from\":\"B\",\"to\":\"A\"}],\"startNode\":\"A\"}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[{\"from\":\"A\",\"to\":\"B\"}],\"startNode\":\"A\"}",
                "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\"],\"edges\":[],\"startNode\":\"B\"}")) {
            mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.type").value("urn:problem:invalid-input"))
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
        }
    }

    @Test
    void rejectsMalformedGraphRequestsAndFamilyMismatches() throws Exception {
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":42}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"kind\":\"SORTING\",\"values\":[1]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ALGORITHM_FAMILY_MISMATCH"));
    }

    @Test
    void acceptsMaximumGraphSizeAndReportsDisconnectedNodesInDeclarationOrder() throws Exception {
        var nodes = java.util.stream.IntStream.range(0, 12).mapToObj(index -> "N" + index).toList();
        var edges = new java.util.ArrayList<String>();
        for (int from = 0; from < nodes.size(); from++) {
            for (int to = from + 1; to < nodes.size(); to++) {
                edges.add("{\"from\":\"" + nodes.get(from) + "\",\"to\":\"" + nodes.get(to) + "\"}");
            }
        }
        String quotedNodes = nodes.stream().map(node -> "\"" + node + "\"")
                .collect(java.util.stream.Collectors.joining(","));
        String maximumGraph = "{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[" + quotedNodes
                + "],\"edges\":[" + String.join(",", edges) + "],\"startNode\":\"N0\"}";
        mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                        .content(maximumGraph))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.nodes.length()").value(12))
                .andExpect(jsonPath("$.input.edges.length()").value(66));

        mockMvc.perform(post("/api/v2/algorithms/dfs/trace").contentType(MediaType.APPLICATION_JSON)
                        .content(maximumGraph))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.nodes.length()").value(12))
                .andExpect(jsonPath("$.input.edges.length()").value(66))
                .andExpect(jsonPath("$.events.length()").value(290))
                .andExpect(jsonPath("$.limits.maximumEvents").value(10_000));

        String maximumPathfinding = maximumGraph
                .replace("\"GRAPH_TRAVERSAL\"", "\"PATHFINDING\"")
                .replace("\"startNode\":\"N0\"}",
                        "\"startNode\":\"N0\",\"destination\":\"N11\"}");
        mockMvc.perform(post("/api/v2/algorithms/dijkstra/trace").contentType(MediaType.APPLICATION_JSON)
                        .content(maximumPathfinding))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.input.nodes.length()").value(12))
                .andExpect(jsonPath("$.input.edges.length()").value(66))
                .andExpect(jsonPath("$.result.pathFound").value(true))
                .andExpect(jsonPath("$.result.totalCost").value(1))
                .andExpect(jsonPath("$.limits.maximumEvents").value(10_000));

        mockMvc.perform(post("/api/v2/algorithms/bfs/trace").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kind\":\"GRAPH_TRAVERSAL\",\"nodes\":[\"A\",\"C\",\"B\"],"
                                + "\"edges\":[{\"from\":\"A\",\"to\":\"C\"}],\"startNode\":\"A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.unreachableNodes[0]").value("B"))
                .andExpect(jsonPath("$.events[-1].state.nodeStatuses.B").value("UNREACHED"));
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
