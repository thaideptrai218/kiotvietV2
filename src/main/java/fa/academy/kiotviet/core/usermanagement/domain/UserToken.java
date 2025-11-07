package fa.academy.kiotviet.core.usermanagement.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Table(name = "user_tokens")
@Data
public class UserToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_info_id", nullable = false, foreignKey = @ForeignKey(name = "fk_usertoken_user"))
    private UserInfo user;

    @NotBlank(message = "Refresh token hash is required")
    @Size(max = 255, message = "Refresh token hash must not exceed 255 characters")
    @Column(name = "refresh_token_hash", nullable = false)
    private String refreshTokenHash;

    @Size(max = 500, message = "Device info must not exceed 500 characters")
    @Column(name = "device_info")
    private String deviceInfo;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", length = 20)
    private DeviceType deviceType = DeviceType.web;

    @Size(max = 45, message = "IP address must not exceed 45 characters")
    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @NotNull(message = "Expires at is required")
    @Column(name = "expires_at", nullable = false)
    private java.time.LocalDateTime expiresAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "last_used")
    private java.time.LocalDateTime lastUsed;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        lastUsed = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUsed = java.time.LocalDateTime.now();
    }

    public enum DeviceType {
        web, mobile, desktop
    }
}