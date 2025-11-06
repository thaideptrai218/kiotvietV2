package fa.academy.kiotviet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration for Kiotviet application.
 *
 * This configuration provides basic security setup including:
 * - Password encoding with BCrypt
 * - HTTP security configuration
 * - Public endpoint access for development
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
     * Currently allows all requests for development purposes.
     *
     * @param http HttpSecurity builder
     * @return SecurityFilterChain configuration
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                // Permit authentication endpoints
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                // Allow all requests for development - will be restricted later
                .anyRequest().permitAll()
            )
            .csrf(csrf -> csrf.disable()) // Disable CSRF for development
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())
            ); // Disable frame options for development

        return http.build();
    }
}