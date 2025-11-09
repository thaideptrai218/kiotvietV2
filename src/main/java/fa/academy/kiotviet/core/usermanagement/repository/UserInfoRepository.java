package fa.academy.kiotviet.core.usermanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {

    boolean existsByUsernameAndCompanyId(String username, Long companyId);

    boolean existsByEmailAndCompanyId(String email, Long companyId);

    Optional<UserInfo> findByUsernameAndCompanyId(String username, Long companyId);

    Optional<UserInfo> findByEmailAndCompanyId(String email, Long companyId);

    // For login - find user by globally unique username
    Optional<UserInfo> findByUsername(String username);

    // Find user by email (global)
    Optional<UserInfo> findByEmail(String email);

    // Global validation methods (for registration validation)
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // User management methods
    List<UserInfo> findAllByCompanyId(Long companyId);
}
