package fa.academy.kiotviet.infrastructure.security;

import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * JWT authentication filter that validates JWT tokens on each request
 * and sets the authentication context if token is valid.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserInfoRepository userInfoRepository;
    private final CompanyRepository companyRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && !jwtUtil.isTokenExpired(jwt)) {
                String username = jwtUtil.extractUsername(jwt);
                Long userId = jwtUtil.extractUserId(jwt);
                Long companyId = jwtUtil.extractCompanyId(jwt);
                String role = jwtUtil.extractRole(jwt);

                // Verify user exists and is active
                UserInfo user = userInfoRepository.findById(userId)
                    .filter(UserInfo::getIsActive)
                    .orElse(null);

                // Check if company is suspended (block login if suspended)
                if (companyId != null && companyId > 0) {
                    Company company = companyRepository.findById(companyId).orElse(null);
                    if (company != null && Boolean.TRUE.equals(company.getIsSuspended())) {
                        log.warn("Company suspended, blocking login for user: {} (Company ID: {})", username, companyId);
                        // Clear any existing authentication and block request
                        SecurityContextHolder.clearContext();
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Company account is suspended\"}");
                        return; // Stop filter chain processing
                    }
                }

                if (user != null && username.equals(user.getUsername())) {
                    // Build authorities
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    // Add role as authority (e.g., ROLE_ADMIN)
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().toUpperCase()));
                    
                    // Add permissions
                    // See fa.academy.kiotviet.core.usermanagement.domain.UserInfo.UserPermission for available permissions
                    if (StringUtils.hasText(user.getPermissions())) {
                        Arrays.stream(user.getPermissions().split(","))
                            .filter(StringUtils::hasText)
                            .map(String::trim)
                            .map(SimpleGrantedAuthority::new)
                            .forEach(authorities::add);
                    }

                    // Create authentication token with user info
                    UserPrincipal userPrincipal = new UserPrincipal(
                        userId,
                        companyId,
                        username,
                        role,
                        user.getFullName() != null ? user.getFullName() : "",
                        user.getEmail() != null ? user.getEmail() : "",
                        authorities
                    );
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                            userPrincipal,
                            null,
                            authorities
                        );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in context
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("Set authentication for user: {} (ID: {}, Company: {})",
                             username, userId, companyId);
                } else {
                    log.warn("JWT token valid but user not found or inactive: {}", username);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
            // Clear authentication on any error
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header.
     *
     * @param request HTTP request
     * @return JWT token or null if not found
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * User principal implementation that holds user information.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @EqualsAndHashCode(callSuper = false)
    public static class UserPrincipal implements UserDetails {
        private Long userId;
        private Long companyId;
        private String username;
        private String role;
        private String fullName;
        private String email;
        private Collection<? extends GrantedAuthority> authorities;

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return true;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities != null ? authorities : new ArrayList<>();
        }

        @Override
        public String getPassword() {
            return null; // No password needed for JWT authentication
        }
    }
}