package fa.academy.kiotviet.application.service;

import fa.academy.kiotviet.application.dto.shared.ErrorResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ResponseFactory {

    // Success responses
    public static <T> SuccessResponse<T> success(T data, String message) {
        return SuccessResponse.of(data, message);
    }

    public static <T> SuccessResponse<T> success(T data, String message, int httpCode) {
        return SuccessResponse.of(data, message, httpCode);
    }

    public static <T> SuccessResponse<T> success(String message) {
        return SuccessResponse.of(message);
    }

    public static <T> SuccessResponse<T> created(T data, String message) {
        return SuccessResponse.of(data, message, HttpStatus.CREATED.value());
    }

    public static <T> SuccessResponse<T> accepted(T data, String message) {
        return SuccessResponse.of(data, message, HttpStatus.ACCEPTED.value());
    }

    // Error responses
    public static ErrorResponse error(String message, String errorCode) {
        return ErrorResponse.of(message, errorCode, HttpStatus.BAD_REQUEST.value());
    }

    public static ErrorResponse error(String message, String errorCode, int httpCode) {
        return ErrorResponse.of(message, errorCode, httpCode);
    }

    public static ErrorResponse error(String message, String errorCode, int httpCode, String path) {
        return ErrorResponse.of(message, errorCode, httpCode, path);
    }

    public static ErrorResponse badRequest(String message, String errorCode) {
        return ErrorResponse.of(message, errorCode, HttpStatus.BAD_REQUEST.value());
    }

    public static ErrorResponse notFound(String message, String errorCode) {
        return ErrorResponse.of(message, errorCode, HttpStatus.NOT_FOUND.value());
    }

    public static ErrorResponse internalError(String message, String errorCode) {
        return ErrorResponse.of(message, errorCode, HttpStatus.INTERNAL_SERVER_ERROR.value());
    }

    public static ErrorResponse unauthorized(String message, String errorCode) {
        return ErrorResponse.of(message, errorCode, HttpStatus.UNAUTHORIZED.value());
    }

    public static ErrorResponse forbidden(String message, String errorCode) {
        return ErrorResponse.of(message, errorCode, HttpStatus.FORBIDDEN.value());
    }
}