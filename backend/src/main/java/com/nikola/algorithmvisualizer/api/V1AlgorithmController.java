package com.nikola.algorithmvisualizer.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nikola.algorithmvisualizer.algorithm.AlgorithmRegistry;
import com.nikola.algorithmvisualizer.trace.AlgorithmCatalogEntry;
import com.nikola.algorithmvisualizer.trace.VersionedAlgorithmTrace;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/algorithms")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class V1AlgorithmController {

    private final AlgorithmRegistry registry;

    public V1AlgorithmController(AlgorithmRegistry registry) {
        this.registry = registry;
    }

    @org.springframework.web.bind.annotation.GetMapping
    public java.util.List<AlgorithmCatalogEntry> catalog() { return registry.catalog(); }

    @PostMapping("/{algorithmId}/trace")
    @ResponseStatus(HttpStatus.OK)
    public VersionedAlgorithmTrace<?> trace(@org.springframework.web.bind.annotation.PathVariable String algorithmId,
            @Valid @RequestBody SortRequest request) {
        return registry.require(algorithmId).execute(request.values());
    }

    @PostMapping("/insertion-sort")
    public VersionedAlgorithmTrace<?> legacyV1Insertion(@Valid @RequestBody SortRequest request) {
        return registry.require("insertion").execute(request.values());
    }
}
