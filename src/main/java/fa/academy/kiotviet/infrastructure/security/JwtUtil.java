package fa.academy.kiotviet.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret:mySecretKeyForKiotviet123456789}")
    private String jwtSecret;

    @Value("${jwt.expiration:900}")
    private Long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800}")
    private Long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Long userId, Long companyId, String username, String role) {
        Map<String, Object> claims = Map.of(
            "userId", userId,
            "companyId", companyId,
            "username", username,
            "role", role
        );

        return Jwts.builder()
            .claims(claims)
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtExpiration * 1000))
            .signWith(getSigningKey())
            .compact();
    }

    public String generateRefreshToken(Long userId, String jti) {
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshExpiration);

        return Jwts.builder()
            .claim("userId", userId)
            .claim("type", "refresh")
            .id(jti)
            .issuedAt(new Date())
            .expiration(Date.from(expiresAt.atZone(ZoneId.systemDefault()).toInstant()))
            .signWith(getSigningKey())
            .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public Long extractCompanyId(String token) {
        return extractClaims(token).get("companyId", Long.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public String extractType(String token) {
        return extractClaims(token).get("type", String.class);
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    public boolean validateToken(String token, String username) {
        try {
            String tokenUsername = extractUsername(token);
            return tokenUsername.equals(username) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            return "refresh".equals(extractType(token)) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    public Long getAccessTokenExpiration() {
        return jwtExpiration;
    }
}