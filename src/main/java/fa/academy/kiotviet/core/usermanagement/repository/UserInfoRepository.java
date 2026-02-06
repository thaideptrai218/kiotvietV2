package fa.academy.kiotviet.core.usermanagement.repository;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long>, JpaSpecificationExecutor<UserInfo> {

    boolean existsByUsernameAndCompanyId(String username, Long companyId);

    boolean existsByEmailAndCompanyId(String email, Long companyId);

    boolean existsByUsernameAndCompanyIdAndIdNot(String username, Long companyId, Long id);

    boolean existsByEmailAndCompanyIdAndIdNot(String email, Long companyId, Long id);

    Optional<UserInfo> findByUsernameAndCompanyId(String username, Long companyId);

    Optional<UserInfo> findByEmailAndCompanyId(String email, Long companyId);

    Optional<UserInfo> findByIdAndCompanyId(Long id, Long companyId);

    // For login - find user by globally unique username
    Optional<UserInfo> findByUsername(String username);

    // Find user by email (global)
    Optional<UserInfo> findByEmail(String email);

    // Global validation methods (for registration validation)
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // User management methods
    List<UserInfo> findAllByCompanyId(Long companyId);

    List<UserInfo> findAllByIdInAndCompanyId(List<Long> ids, Long companyId);

    // Dashboard methods
    long countByCompanyId(Long companyId);

    long countActiveCustomersByCompanyId(Long companyId);

    // System admin methods (cross-tenant queries)
    List<UserInfo> findAll();

    long countByCompanyIdAndIsActiveTrue(Long companyId);

    List<UserInfo> findAllByCompanyIdAndIsActive(Long companyId, Boolean isActive);
}
