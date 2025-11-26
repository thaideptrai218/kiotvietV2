package fa.academy.kiotviet.config;

import fa.academy.kiotviet.application.dto.shared.ErrorResponse;
import fa.academy.kiotviet.core.shared.exception.KiotvietException;
import fa.academy.kiotviet.infrastructure.exception.BadRequestException;
import fa.academy.kiotviet.infrastructure.exception.ConflictException;
import fa.academy.kiotviet.infrastructure.exception.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @Value("${app.include-stack-trace:false}")
        private boolean includeStackTrace;

        /**
         * Converts exception stack trace to string for development debugging
         */
        private String getStackTraceAsString(Exception e) {
                if (!includeStackTrace) {
                        return null;
                }

                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);
                e.printStackTrace(pw);
                return sw.toString();
        }

        /**
         * Prints the full stack trace to console for debugging
         */
        private void printStackTraceToConsole(Exception e) {
                System.err.println("=== EXCEPTION STACK TRACE ===");
                System.err.println("Timestamp: " + java.time.LocalDateTime.now());
                System.err.println("Exception: " + e.getClass().getSimpleName());
                System.err.println("Message: " + e.getMessage());
                System.err.println("Full Stack Trace:");
                e.printStackTrace(System.err);
                System.err.println("=== END STACK TRACE ===");
        }

        // Custom Kiotviet exceptions
        @ExceptionHandler(KiotvietException.class)
        public ResponseEntity<ErrorResponse> handleKiotvietException(KiotvietException e, HttpServletRequest request) {
                // Print full stack trace to console for debugging
                printStackTraceToConsole(e);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(e.getHttpStatus())
                                .message(e.getMessage())
                                .errorCode(e.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();

                return ResponseEntity.status(e.getHttpStatus()).body(errorResponse);
        }

        @ExceptionHandler(NotFoundException.class)
        public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e, HttpServletRequest request) {
                printStackTraceToConsole(e);
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.NOT_FOUND.value())
                                .message(e.getMessage())
                                .errorCode(e.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException e, HttpServletRequest request) {
                printStackTraceToConsole(e);
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.BAD_REQUEST.value())
                                .message(e.getMessage())
                                .errorCode(e.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();
                return ResponseEntity.badRequest().body(errorResponse);
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ErrorResponse> handleConflict(ConflictException e, HttpServletRequest request) {
                printStackTraceToConsole(e);
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.CONFLICT.value())
                                .message(e.getMessage())
                                .errorCode(e.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }

        // Validation errors
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e,
                        HttpServletRequest request) {
                // Print full stack trace to console for debugging
                printStackTraceToConsole(e);

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
                                .stackTrace(getStackTraceAsString(e))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        // Illegal argument exceptions (business logic violations)
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e,
                        HttpServletRequest request) {
                // Print full stack trace to console for debugging
                printStackTraceToConsole(e);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.BAD_REQUEST.value())
                                .message(e.getMessage())
                                .errorCode("BAD_REQUEST")
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        // JSON parsing errors (malformed JSON)
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ErrorResponse> handleJsonParseException(HttpMessageNotReadableException e,
                        HttpServletRequest request) {
                // Print full stack trace to console for debugging
                printStackTraceToConsole(e);

                String message = "Malformed JSON request. Please check your JSON syntax.";

                // Try to provide more specific error message
                if (e.getMessage() != null) {
                        if (e.getMessage().contains("JSON parse error")) {
                                message = "Invalid JSON format. Please check for syntax errors like missing quotes, commas, or brackets.";
                        } else if (e.getMessage().contains("Unrecognized field")) {
                                message = "Invalid JSON field. Please check field names and data types.";
                        }
                }

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.BAD_REQUEST.value())
                                .message(message)
                                .errorCode("JSON_PARSE_ERROR")
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        // Type mismatch errors (wrong data types in path variables or request parameters)
        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException e,
                        HttpServletRequest request) {
                // Print full stack trace to console for debugging
                printStackTraceToConsole(e);

                String expectedType = e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "unknown";
                String message = String.format("Invalid parameter type for '%s'. Expected: %s", e.getName(), expectedType);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.BAD_REQUEST.value())
                                .message(message)
                                .errorCode("TYPE_MISMATCH_ERROR")
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        // Generic exception handler
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(Exception e, HttpServletRequest request) {
                // Print full stack trace to console for debugging
                printStackTraceToConsole(e);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .httpCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .message("Internal server error occurred")
                                .errorCode("INTERNAL_SERVER_ERROR")
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .stackTrace(getStackTraceAsString(e))
                                .build();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
}
