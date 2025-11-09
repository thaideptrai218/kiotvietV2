package fa.academy.kiotviet.config;

import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration for Kiotviet application.
 *
 * This configuration provides JWT-based security including:
 * - Password encoding with BCrypt
 * - JWT authentication filter
 * - Public endpoint access for authentication
 * - Protected API endpoints requiring JWT tokens
 * - Stateless session management
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configures password encoder for hashing user passwords.
     * BCrypt is used for its strong security properties.
     *
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures HTTP security for the application.
     * JWT authentication is required for most API endpoints.
     *
     * @param http HttpSecurity builder
     * @return SecurityFilterChain configuration
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for JWT stateless APIs
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Stateless sessions
            )
            .authorizeHttpRequests(authz -> authz
                // Permit authentication endpoints
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/refresh").permitAll()
                .requestMatchers("/api/auth/forgot").permitAll()
                .requestMatchers("/api/auth/reset").permitAll()

                // Permit static resources and web pages
                .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                .requestMatchers("/", "/login", "/register").permitAll()

                // Health check endpoint
                .requestMatchers("/actuator/health").permitAll()

                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()

                // Allow other requests for now (web pages, etc.)
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
