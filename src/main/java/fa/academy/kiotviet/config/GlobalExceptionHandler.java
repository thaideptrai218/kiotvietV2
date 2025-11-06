package fa.academy.kiotviet.config;

import fa.academy.kiotviet.application.dto.shared.ErrorResponse;
import fa.academy.kiotviet.core.shared.exception.KiotvietException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Custom Kiotviet exceptions
    @ExceptionHandler(KiotvietException.class)
    public ResponseEntity<ErrorResponse> handleKiotvietException(KiotvietException e, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.of(
                e.getMessage(),
                e.getErrorCode(),
                e.getHttpStatus(),
                request.getRequestURI());

        return ResponseEntity.status(e.getHttpStatus()).body(errorResponse);
    }

    // Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e,
            HttpServletRequest request) {
        List<String> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .httpCode(HttpStatus.BAD_REQUEST.value())
                .message("Validation failed")
                .errorCode("VALIDATION_ERROR")
                .details(errors)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Illegal argument exceptions (business logic violations)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e,
            HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.of(
                e.getMessage(),
                "BAD_REQUEST",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Generic exception handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.of(
                "Internal server error occurred",
                "INTERNAL_SERVER_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI());

        // Log the full error for debugging
        e.printStackTrace();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}