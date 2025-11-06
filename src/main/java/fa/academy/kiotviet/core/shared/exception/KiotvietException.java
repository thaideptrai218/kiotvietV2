package fa.academy.kiotviet.core.shared.exception;

import lombok.Getter;

@Getter
public abstract class KiotvietException extends RuntimeException {
    private final String errorCode;
    private final int httpStatus;

    public KiotvietException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public KiotvietException(String message, String errorCode, int httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
}