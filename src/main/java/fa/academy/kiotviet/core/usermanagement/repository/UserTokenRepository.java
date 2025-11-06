package fa.academy.kiotviet.core.usermanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.domain.UserToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    List<UserToken> findByUserAndIsActiveTrue(UserInfo user);

    Optional<UserToken> findByRefreshTokenHashAndExpiresAtAfterAndIsActiveTrue(String refreshTokenHash, LocalDateTime now);

    void deleteByUser(UserInfo user);

    void deleteByExpiresAtBefore(LocalDateTime date);
}