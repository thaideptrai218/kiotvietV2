# Spring Security Filter Chain: A Comprehensive Guide

## Part 1: What is SecurityFilterChain? The Big Picture

### The Core Concept
Think of Spring Security's SecurityFilterChain as a **bouncer club entrance system**. When someone (HTTP request) wants to enter your application (the club), they must pass through a series of security checkpoints. Each checkpoint (filter) performs a specific security check before allowing the person to proceed deeper into the club.

**Real-world analogy**:
- Club entrance = Your web application
- Security checkpoints = Security filters
- Different VIP levels = Different security requirements
- Guest list = Authentication tokens/credentials
- Security guards = Spring Security filters

### Why SecurityFilterChain Matters
In your Kiotviet multi-tenant system, the SecurityFilterChain is crucial because:
1. **Multi-tenant isolation**: Ensures users only access their own data
2. **JWT authentication**: Validates access tokens for every request
3. **Role-based access**: Different users (admin/manager/staff) need different permissions
4. **API protection**: Secures your product catalogs and inventory endpoints

## Part 2: Understanding Security Filters

### The Filter Chain Architecture
```
HTTP Request → Filter 1 → Filter 2 → Filter 3 → ... → Filter N → Your Controller
                ↑           ↑           ↑
            Security    Security    Security
            Checkpoint  Checkpoint  Checkpoint
```

### Common Security Filters (In Order)

#### 1. **ChannelProcessingFilter**
- **Purpose**: Ensures HTTPS usage (channel security)
- **Analogy**: Checks if the entrance is secure (not a back door)
- **Use case**: Forces HTTP to HTTPS redirects

#### 2. **WebAsyncManagerIntegrationFilter**
- **Purpose**: Integrates Spring Security with async requests
- **Analogy**: Handles VIP lane processing
- **Use case**: When using async controllers

#### 3. **SecurityContextPersistenceFilter**
- **Purpose**: Loads and saves the SecurityContext between requests
- **Analogy**: Keeps track of who's inside the club
- **Use case**: Session management

#### 4. **HeaderWriterFilter**
- **Purpose**: Adds security headers to responses
- **Analogy**: Puts security stamps on exit passes
- **Use case**: XSS protection, CSRF headers

#### 5. **CsrfFilter**
- **Purpose**: Prevents Cross-Site Request Forgery attacks
- **Analogy**: Checks if the request form is legitimate
- **Use case**: Form submissions, state-changing operations

#### 6. **LogoutFilter**
- **Purpose**: Handles logout requests
- **Analogy**: Manages the exit process
- **Use case**: User logout functionality

#### 7. **UsernamePasswordAuthenticationFilter**
- **Purpose**: Processes login requests
- **Analogy**: The main ID checker at the entrance
- **Use case**: Login form processing

#### 8. **BasicAuthenticationFilter**
- **Purpose**: Handles HTTP Basic authentication
- **Analogy**: Checks simple ID cards
- **Use case**: API authentication

#### 9. **JwtAuthenticationFilter** (Custom)
- **Purpose**: Validates JWT tokens
- **Analogy**: Scans VIP badges
- **Use case**: Your Kiotviet API authentication

#### 10. **AnonymousAuthenticationFilter**
- **Purpose**: Provides anonymous user if no authentication found
- **Analogy**: Gives unregistered visitors basic access
- **Use case**: Public endpoints

#### 11. **SessionManagementFilter**
- **Purpose**: Manages session fixation and timeouts
- **Analogy**: Monitors how long people stay inside
- **Use case**: Session security

#### 12. **ExceptionTranslationFilter**
- **Purpose**: Converts security exceptions to HTTP responses
- **Analogy**: Handles troublemakers politely
- **Use case**: Error handling for security issues

#### 13. **FilterSecurityInterceptor**
- **Purpose**: Enforces access rules based on authorization
- **Analogy**: Final checkpoint - checks VIP level for specific areas
- **Use case**: Role-based access control

## Part 3: Setting Up SecurityFilterChain Step by Step

### Step 1: Basic Configuration Class Structure
```java
@Configuration
@EnableWebSecurity  // This tells Spring to enable web security
@EnableMethodSecurity  // Enables method-level security (@PreAuthorize, etc.)
public class SecurityConfig {

    // We'll add our SecurityFilterChain bean here
}
```

### Step 2: Creating Your First SecurityFilterChain
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .build();  // This creates the filter chain
}
```

### Step 3: Adding Authentication Configuration
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())  // Disable CSRF for API usage
        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // More configuration will come here
        .build();
}
```

### Step 4: Adding JWT Authentication Filter
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    JwtAuthenticationFilter jwtAuthFilter = new JwtAuthenticationFilter(jwtService, userDetailsService);

    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

## Part 4: Complete SecurityFilterChain Configuration for Kiotviet

### Full Example with Detailed Explanations
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    /**
     * Main security filter chain configuration
     * This is like setting up all the security checkpoints at your club entrance
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // 1. Disable CSRF because we're using JWT tokens (stateless)
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/auth/**")) // Ignore auth endpoints
            )

            // 2. Configure session management (stateless for JWT)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 3. Set up authentication provider (for login validation)
            .authenticationProvider(authenticationProvider)

            // 4. Add JWT filter before the username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // 5. Configure authorization rules (who can access what)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/health", "/actuator/health").permitAll()

                // Static resources (CSS, JS, images)
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()

                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                // Manager-level endpoints
                .requestMatchers("/api/managers/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "MANAGER")

                // Staff endpoints (authenticated users)
                .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                .requestMatchers("/api/products/**").authenticated()
                .requestMatchers("/api/categories/**").authenticated()

                // All other requests need authentication
                .anyRequest().authenticated()
            )

            // 6. Configure CORS (Cross-Origin Resource Sharing)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 7. Configure form login (if you have a web interface)
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .permitAll()
            )

            // 8. Configure logout
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )

            // 9. Exception handling
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(unauthorizedEntryPoint())
                .accessDeniedHandler(accessDeniedHandler())
            )

            // 10. Build the final filter chain
            .build();
    }

    /**
     * CORS configuration for cross-origin requests
     * This allows your frontend (running on different port) to access your API
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Custom authentication entry point for unauthorized access
     * Returns 401 Unauthorized instead of redirecting to login page
     */
    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Please authenticate to access this resource\"}");
        };
    }

    /**
     * Custom access denied handler for insufficient permissions
     * Returns 403 Forbidden when user is authenticated but lacks permissions
     */
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"You don't have permission to access this resource\"}");
        };
    }
}
```

## Part 5: How the Filter Chain Processes Requests

### Request Flow Diagram
```
1. HTTP Request Arrives
   ↓
2. SecurityContextPersistenceFilter
   (Loads user session if exists)
   ↓
3. CsrfFilter
   (Validates CSRF token)
   ↓
4. JwtAuthenticationFilter
   (Validates JWT token, sets authentication)
   ↓
5. FilterSecurityInterceptor
   (Checks if user has required permissions)
   ↓
6. Your Controller Method
   (Business logic executes)
   ↓
7. Response Sent Back
   (Security headers added automatically)
```

### Step-by-Step Processing Example

**Scenario**: A manager tries to create a new product via POST /api/products

1. **Request arrives**: `POST /api/products` with JWT token in header
2. **CsrfFilter**: Skips CSRF check (we disabled it for APIs)
3. **JwtAuthenticationFilter**:
   - Extracts JWT from Authorization header
   - Validates token signature and expiration
   - Creates Authentication object with user's roles
   - Sets it in SecurityContext
4. **FilterSecurityInterceptor**:
   - Sees request matches `/api/products/**` pattern
   - Checks if user has required role (ADMIN or MANAGER)
   - User is MANAGER → Access granted
5. **Controller executes**: Product creation logic runs
6. **Response sent**: New product details returned with user information

## Part 6: Custom Authentication Filter Implementation

### JWT Authentication Filter for Kiotviet
```java
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * This filter runs once per request
     * It's like a security guard checking every person's VIP badge
     */
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Check if Authorization header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token found, proceed to next filter (user will be anonymous)
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract JWT token (remove "Bearer " prefix)
        jwt = authHeader.substring(7);

        try {
            // 3. Extract email from JWT token
            userEmail = jwtService.extractUsername(jwt);

            // 4. Check if user is not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 5. Load user details from database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // 6. Validate JWT token
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 7. Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // No credentials for JWT
                        userDetails.getAuthorities() // User's roles/permissions
                    );

                    // 8. Set authentication details
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 9. Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("User {} authenticated successfully", userEmail);
                } else {
                    log.warn("Invalid JWT token for user {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
            // Don't throw exception here, let request proceed as anonymous
        }

        // 10. Continue to next filter in the chain
        filterChain.doFilter(request, response);
    }
}
```

### JWT Service Implementation
```java
@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    /**
     * Extract username (email) from JWT token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract any claim from JWT token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generate JWT token for user
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generate JWT token with extra claims
     */
    public String generateToken(
        Map<String, Object> extraClaims,
        UserDetails userDetails
    ) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    /**
     * Generate refresh token
     */
    public String generateRefreshToken(
        UserDetails userDetails
    ) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    /**
     * Check if token is valid for given user
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extract expiration date from token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Build JWT token with specified claims and expiration
     */
    private String buildToken(
        Map<String, Object> extraClaims,
        UserDetails userDetails,
        long expiration
    ) {
        // Add account_id for multi-tenant support
        if (userDetails instanceof KiotvietUserDetails) {
            KiotvietUserDetails kiotvietUser = (KiotvietUserDetails) userDetails;
            extraClaims.put("account_id", kiotvietUser.getAccountId());
        }

        return Jwts
            .builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts
            .parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    /**
     * Get signing key for JWT
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

## Part 7: Multiple Configuration Examples

### Example 1: Simple API-Only Configuration
```java
@Configuration
@EnableWebSecurity
public class ApiSecurityConfig {

    @Bean
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### Example 2: Web Application with Form Login
```java
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.enable()) // Enable CSRF for web forms
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/home", "/register").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .failureUrl("/login?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .rememberMe(remember -> remember
                .key("uniqueAndSecret")
                .tokenValiditySeconds(86400) // 1 day
            )
            .build();
    }
}
```

### Example 3: Multi-Tenant Configuration for Kiotviet
```java
@Configuration
@EnableWebSecurity
public class MultiTenantSecurityConfig {

    @Bean
    public SecurityFilterChain multiTenantSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(tenantFilter(), JwtAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Tenant-specific endpoints
                .requestMatchers("/api/{accountId}/**").access(
                    (authentication, request) -> {
                        String requestAccountId = request.getVariables().get("accountId");
                        return hasAccessToTenant(authentication.get(), requestAccountId);
                    }
                )

                // Admin endpoints (system admin)
                .requestMatchers("/api/system/**").hasRole("SYSTEM_ADMIN")

                // Default: authenticated users
                .anyRequest().authenticated()
            )
            .build();
    }

    private AuthorizationDecision hasAccessToTenant(
        Authentication authentication,
        String tenantAccountId
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return new AuthorizationDecision(false);
        }

        // Extract account_id from JWT claims or user details
        String userAccountId = extractUserAccountId(authentication);
        return new AuthorizationDecision(tenantAccountId.equals(userAccountId));
    }
}
```

## Part 8: Best Practices and Common Pitfalls

### Best Practices ✅

#### 1. **Use Separate SecurityFilterChain Beans**
```java
@Configuration
public class SecurityConfig {

    @Bean
    @Order(1) // Higher priority
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/api/**") // Only applies to /api/**
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .build();
    }

    @Bean
    @Order(2) // Lower priority
    public SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/**") // Applies to everything else
            .formLogin(form -> form.loginPage("/login"))
            .build();
    }
}
```

#### 2. **Always Disable CSRF for JWT APIs**
```java
// ❌ WRONG - CSRF will block your API calls
.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())

// ✅ CORRECT - Disable CSRF for stateless APIs
.csrf(csrf -> csrf.disable())
.sessionManagement(session ->
    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

#### 3. **Proper Exception Handling**
```java
.exceptionHandling(exceptions -> exceptions
    .authenticationEntryPoint((request, response, authException) -> {
        response.setStatus(401);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Unauthorized\"}");
    })
    .accessDeniedHandler((request, response, accessDeniedException) -> {
        response.setStatus(403);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Forbidden\"}");
    })
)
```

#### 4. **Use Method-Level Security for Fine-Grained Control**
```java
@RestController
public class ProductController {

    @GetMapping("/api/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public Product getProduct(@PathVariable Long id) {
        // Any authenticated user can view products
    }

    @PostMapping("/api/products")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Product createProduct(@RequestBody Product product) {
        // Only admins and managers can create products
    }

    @DeleteMapping("/api/products/{id}")
    @PreAuthorize("hasRole('ADMIN') or @productSecurity.isOwner(#id, authentication.name)")
    public void deleteProduct(@PathVariable Long id) {
        // Only admins or product owners can delete
    }
}
```

### Common Pitfalls ❌

#### 1. **Forgetting to Set Stateless Session Policy**
```java
// ❌ WRONG - Will create HTTP sessions for JWT users
.csrf(csrf -> csrf.disable())
// Missing session management configuration

// ✅ CORRECT - Proper stateless configuration
.csrf(csrf -> csrf.disable())
.sessionManagement(session ->
    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

#### 2. **Filter Order Mistakes**
```java
// ❌ WRONG - JWT filter placed after authentication filter
.addFilterAfter(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

// ✅ CORRECT - JWT filter must run before authentication
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
```

#### 3. **Missing CORS Configuration**
```java
// ❌ WRONG - Frontend can't access API from different port
// No CORS configuration

// ✅ CORRECT - Proper CORS setup
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

#### 4. **Broad PermitAll() Rules**
```java
// ❌ WRONG - Too permissive
.authorizeHttpRequests(auth -> auth
    .anyRequest().permitAll() // Everything is public!
)

// ✅ CORRECT - Specific public endpoints only
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**", "/health").permitAll()
    .anyRequest().authenticated() // Everything else requires auth
)
```

#### 5. **Not Handling JWT Exceptions Properly**
```java
// ❌ WRONG - Exceptions bubble up and cause 500 errors
@Override
protected void doFilterInternal(...) {
    String token = extractToken(request);
    String username = jwtService.extractUsername(token); // Can throw exception
}

// ✅ CORRECT - Proper exception handling
@Override
protected void doFilterInternal(...) {
    try {
        String token = extractToken(request);
        if (token != null) {
            String username = jwtService.extractUsername(token);
            // Process token...
        }
    } catch (ExpiredJwtException e) {
        log.debug("JWT token expired");
    } catch (JwtException e) {
        log.debug("Invalid JWT token");
    }
}
```

## Part 9: Testing Your Security Configuration

### Test Security Configuration
```java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicEndpoints_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/auth/login"))
               .andExpect(status().isOk());
    }

    @Test
    void protectedEndpoints_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/products"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoints_WithValidToken_ShouldReturn200() throws Exception {
        String validToken = generateValidToken();

        mockMvc.perform(get("/api/products")
               .header("Authorization", "Bearer " + validToken))
               .andExpect(status().isOk());
    }

    @Test
    void adminEndpoints_WithUserToken_ShouldReturn403() throws Exception {
        String userToken = generateUserToken();

        mockMvc.perform(delete("/api/products/1")
               .header("Authorization", "Bearer " + userToken))
               .andExpect(status().isForbidden());
    }
}
```

## Part 10: Troubleshooting Common Issues

### Common Problems and Solutions

#### 1. **401 Unauthorized on Valid Token**
**Problem**: JWT token is valid but still getting 401
**Solution**: Check filter order and token extraction logic

#### 2. **403 Forbidden on Permitted Endpoint**
**Problem**: User has correct role but still getting 403
**Solution**: Verify role names (ROLE_USER vs USER)

#### 3. **CORS Issues**
**Problem**: Frontend can't access API
**Solution**: Ensure CORS is configured before security filters

#### 4. **Session Creation in Stateless App**
**Problem**: Seeing JSESSIONID cookies in stateless API
**Solution**: Verify SessionCreationPolicy.STATELESS is set

#### 5. **CSRF Blocking API Calls**
**Problem**: POST/PUT requests failing with 403
**Solution**: Disable CSRF for API endpoints

## Summary: Your SecurityFilterChain Knowledge

1. **SecurityFilterChain** = Series of security checkpoints for HTTP requests
2. **Filters** = Individual security checks (authentication, authorization, CSRF, etc.)
3. **Configuration** = Define which endpoints need which security measures
4. **JWT Integration** = Custom filter to validate tokens
5. **Multi-tenant** = Tenant-aware security policies
6. **Best Practices** = Proper exception handling, filter order, CORS setup

For your Kiotviet project, you now have:
- Complete JWT authentication system
- Role-based authorization (admin/manager/staff)
- Multi-tenant security isolation
- API-first security configuration
- Proper error handling and CORS support

This SecurityFilterChain setup will secure your product catalog, inventory management, and user authentication while maintaining the performance and scalability your multi-tenant system requires.