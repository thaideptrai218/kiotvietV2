package fa.academy.kiotviet.infrastructure.security;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

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

                if (user != null && username.equals(user.getUsername())) {
                    // Create authentication token
                    UserPrincipal userPrincipal = new UserPrincipal(userId, companyId, username, role);
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                            userPrincipal,
                            null,
                            new ArrayList<>() // No authorities for now
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
    public static class UserPrincipal implements UserDetails {
        private final Long userId;
        private final Long companyId;
        private final String username;
        private final String role;

        public UserPrincipal(Long userId, Long companyId, String username, String role) {
            this.userId = userId;
            this.companyId = companyId;
            this.username = username;
            this.role = role;
        }

        public Long getUserId() {
            return userId;
        }

        public Long getCompanyId() {
            return companyId;
        }

        public String getRole() {
            return role;
        }

        @Override
        public String getUsername() {
            return username;
        }

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
        public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return new ArrayList<>();
        }

        @Override
        public String getPassword() {
            return null; // No password needed for JWT authentication
        }
    }
}