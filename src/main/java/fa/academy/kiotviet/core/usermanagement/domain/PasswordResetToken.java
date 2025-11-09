package fa.academy.kiotviet.core.usermanagement.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_info_id", nullable = false, foreignKey = @ForeignKey(name = "fk_pwreset_user"))
    private UserInfo user;

    @NotBlank(message = "Token hash is required")
    @Size(max = 255, message = "Token hash must not exceed 255 characters")
    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @NotNull(message = "Expires at is required")
    @Column(name = "expires_at", nullable = false)
    private java.time.LocalDateTime expiresAt;

    @Column(name = "used_at")
    private java.time.LocalDateTime usedAt;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Size(max = 45, message = "IP address must not exceed 45 characters")
    @Column(name = "requested_ip")
    private String requestedIp;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}

