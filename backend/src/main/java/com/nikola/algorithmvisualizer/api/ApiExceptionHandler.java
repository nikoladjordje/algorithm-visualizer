package com.nikola.algorithmvisualizer.api;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.nikola.algorithmvisualizer.trace.TraceLimitExceededException;
import com.nikola.algorithmvisualizer.algorithm.AlgorithmNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail handleInvalidInput(MethodArgumentNotValidException exception) {
        String detail = exception.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("The supplied array is invalid");
        return problem(HttpStatus.BAD_REQUEST, "Invalid input", detail, "INVALID_INPUT", "invalid-input");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail handleMalformedRequest() {
        return problem(HttpStatus.BAD_REQUEST, "Malformed request",
                "The request body must contain a valid JSON array of integers",
                "MALFORMED_REQUEST", "malformed-request");
    }

    @ExceptionHandler(TraceLimitExceededException.class)
    ProblemDetail handleTraceLimitExceeded(TraceLimitExceededException exception) {
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, "Trace limit exceeded", exception.getMessage(),
                "TRACE_LIMIT_EXCEEDED", "trace-limit-exceeded");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail handleInvalidArgument(IllegalArgumentException exception) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid input", exception.getMessage(),
                "INVALID_INPUT", "invalid-input");
    }

    @ExceptionHandler(AlgorithmNotFoundException.class)
    ProblemDetail handleAlgorithmNotFound(AlgorithmNotFoundException exception) {
        return problem(HttpStatus.NOT_FOUND, "Algorithm not found", exception.getMessage(),
                "ALGORITHM_NOT_FOUND", "algorithm-not-found");
    }

    @ExceptionHandler(AlgorithmFamilyMismatchException.class)
    ProblemDetail handleAlgorithmFamilyMismatch(AlgorithmFamilyMismatchException exception) {
        ProblemDetail problem = problem(HttpStatus.BAD_REQUEST, "Algorithm family mismatch",
                exception.getMessage(), "ALGORITHM_FAMILY_MISMATCH", "algorithm-family-mismatch");
        problem.setProperty("field", "kind");
        return problem;
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail handleNoResourceFound(NoResourceFoundException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpectedException() {
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                "The server could not complete the request", "INTERNAL_ERROR", "internal-error");
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail, String code, String type) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setType(URI.create("urn:problem:" + type));
        problem.setProperty("code", code);
        return problem;
    }
}
