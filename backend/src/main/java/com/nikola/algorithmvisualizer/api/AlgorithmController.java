package com.nikola.algorithmvisualizer.api;

import com.nikola.algorithmvisualizer.algorithm.AlgorithmTrace;
import com.nikola.algorithmvisualizer.algorithm.InsertionSortAlgorithm;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/algorithms")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AlgorithmController {

    private final InsertionSortAlgorithm insertionSort;
    private final LegacyTraceAdapter legacyTraceAdapter;

    public AlgorithmController(InsertionSortAlgorithm insertionSort, LegacyTraceAdapter legacyTraceAdapter) {
        this.insertionSort = insertionSort;
        this.legacyTraceAdapter = legacyTraceAdapter;
    }

    @PostMapping("/insertion-sort")
    @ResponseStatus(HttpStatus.OK)
    public AlgorithmTrace insertionSort(@Valid @RequestBody SortRequest request) {
        return legacyTraceAdapter.adapt(insertionSort.execute(request.values()));
    }
}
