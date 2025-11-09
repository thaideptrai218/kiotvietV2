package fa.academy.kiotviet.core.usermanagement.repository;

import fa.academy.kiotviet.core.usermanagement.domain.PasswordResetToken;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHashAndIsUsedFalseAndExpiresAtAfter(String tokenHash, LocalDateTime now);

    void deleteByExpiresAtBefore(LocalDateTime now);

    void deleteByUserAndIsUsedFalse(UserInfo user);
}

