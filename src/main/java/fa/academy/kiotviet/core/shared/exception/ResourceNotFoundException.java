package fa.academy.kiotviet.core.shared.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends KiotvietException {
    public ResourceNotFoundException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.NOT_FOUND.value());
    }

    public ResourceNotFoundException(String message, String errorCode, Throwable cause) {
        super(message, errorCode, HttpStatus.NOT_FOUND.value(), cause);
    }
}