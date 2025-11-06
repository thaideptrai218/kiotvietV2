package fa.academy.kiotviet.core.tenant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fa.academy.kiotviet.core.tenant.domain.Company;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByName(String name);
    boolean existsByEmail(String email);
    Optional<Company> findByEmail(String email);
}