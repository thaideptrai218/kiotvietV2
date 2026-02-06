package fa.academy.kiotviet.core.systemadmin.exception;

/**
 * Exception thrown when a user is not found in system admin operations
 */
public class UserNotFoundException extends SystemAdminException {

    public UserNotFoundException(Long userId) {
        super("User with ID " + userId + " not found", 404);
    }

    public UserNotFoundException(String message) {
        super(message, 404);
    }
}
