package fa.academy.kiotviet.core.shared.exception;

import org.springframework.http.HttpStatus;

public class BusinessRuleException extends KiotvietException {
    public BusinessRuleException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.BAD_REQUEST.value());
    }

    public BusinessRuleException(String message, String errorCode, Throwable cause) {
        super(message, errorCode, HttpStatus.BAD_REQUEST.value(), cause);
    }
}