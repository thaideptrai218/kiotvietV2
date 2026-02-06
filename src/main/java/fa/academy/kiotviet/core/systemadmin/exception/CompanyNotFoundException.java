package fa.academy.kiotviet.core.systemadmin.exception;

/**
 * Exception thrown when a company is not found in system admin operations
 */
public class CompanyNotFoundException extends SystemAdminException {

    public CompanyNotFoundException(Long companyId) {
        super("Company with ID " + companyId + " not found", 404);
    }

    public CompanyNotFoundException(String message) {
        super(message, 404);
    }
}
