package fa.academy.kiotviet.core.systemadmin.exception;

/**
 * Base exception for system admin operations
 */
public class SystemAdminException extends RuntimeException {

    private final int statusCode;

    public SystemAdminException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
