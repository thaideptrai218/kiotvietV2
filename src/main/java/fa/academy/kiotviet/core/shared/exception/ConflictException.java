package fa.academy.kiotviet.core.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception representing HTTP 409 conflict errors (e.g., duplicated resources).
 */
public class ConflictException extends KiotvietException {

    public ConflictException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.CONFLICT.value());
    }

    public ConflictException(String message, String errorCode, Throwable cause) {
        super(message, errorCode, HttpStatus.CONFLICT.value(), cause);
    }
}
