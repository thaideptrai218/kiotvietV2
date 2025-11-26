package fa.academy.kiotviet.infrastructure.exception;

import lombok.Getter;

@Getter
public class BadRequestException extends RuntimeException {

    private final String errorCode;

    public BadRequestException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}

