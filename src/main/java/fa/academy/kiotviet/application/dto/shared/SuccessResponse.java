package fa.academy.kiotviet.application.dto.shared;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SuccessResponse<T> {
    private int httpCode;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    // Factory methods for common cases
    public static <T> SuccessResponse<T> of(T data, String message) {
        return SuccessResponse.<T>builder()
                .httpCode(200)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> SuccessResponse<T> of(T data, String message, int httpCode) {
        return SuccessResponse.<T>builder()
                .httpCode(httpCode)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> SuccessResponse<T> of(String message) {
        return SuccessResponse.<T>builder()
                .httpCode(200)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}