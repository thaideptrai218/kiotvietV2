package fa.academy.kiotviet.core.usermanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;

import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {

    boolean existsByUsernameAndCompanyId(String username, Long companyId);

    boolean existsByEmailAndCompanyId(String email, Long companyId);

    Optional<UserInfo> findByUsernameAndCompanyId(String username, Long companyId);

    Optional<UserInfo> findByEmailAndCompanyId(String email, Long companyId);
}