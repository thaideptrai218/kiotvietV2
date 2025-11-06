package fa.academy.kiotviet.application.dto.shared;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private int httpCode;
    private String message;
    private String errorCode;
    private LocalDateTime timestamp;
    private String path;
    private List<String> details;

    // Factory methods for common cases
    public static ErrorResponse of(String message, String errorCode, int httpCode) {
        return ErrorResponse.builder()
                .httpCode(httpCode)
                .message(message)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(String message, String errorCode, int httpCode, String path) {
        return ErrorResponse.builder()
                .httpCode(httpCode)
                .message(message)
                .errorCode(errorCode)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(String message, String errorCode, int httpCode, List<String> details) {
        return ErrorResponse.builder()
                .httpCode(httpCode)
                .message(message)
                .errorCode(errorCode)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
    }
}