package com.nikola.algorithmvisualizer.api;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SortRequest(
        @NotEmpty(message = "Provide at least one integer")
        @Size(max = 50, message = "A maximum of 50 integers is allowed")
        List<@Valid @NotNull(message = "Array values cannot be null") Integer> values
) {
}
