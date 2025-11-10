-- =============================================
-- PASSWORD RESET TOKENS
-- =============================================

CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_info_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    is_used BOOLEAN DEFAULT FALSE,
    requested_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_info_id) REFERENCES user_info (id) ON DELETE CASCADE,
    INDEX idx_user_active (user_info_id, is_used),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
);

