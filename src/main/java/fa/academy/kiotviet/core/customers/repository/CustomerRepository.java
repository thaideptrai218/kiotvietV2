package fa.academy.kiotviet.core.customers.repository;

import fa.academy.kiotviet.core.customers.domain.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    Optional<Customer> findByIdAndCompany_Id(Long id, Long companyId);

    boolean existsByCompany_IdAndCode(Long companyId, String code);

    boolean existsByCompany_IdAndPhone(Long companyId, String phone);

    Page<Customer> findByCompany_Id(Long companyId, Pageable pageable);
    
    long countByCompanyId(Long companyId);
}
