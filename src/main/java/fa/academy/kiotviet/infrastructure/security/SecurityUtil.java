package fa.academy.kiotviet.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static JwtAuthenticationFilter.UserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        return (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();
    }

    public static Long getCurrentCompanyId() {
        return getCurrentPrincipal().getCompanyId();
    }

    public static Long getCurrentUserId() {
        return getCurrentPrincipal().getUserId();
    }
}
