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

    @org.springframework.data.jpa.repository.Query("select c from Customer c " +
           "where c.company.id = :companyId and c.status = 'ACTIVE' and " +
           "(lower(c.name) like lower(concat('%', :q, '%')) " +
           " or lower(c.phone) like lower(concat('%', :q, '%')) " +
           " or lower(c.code) like lower(concat('%', :q, '%'))) " +
           "order by c.name asc")
    java.util.List<Customer> searchAutocomplete(@org.springframework.data.repository.query.Param("companyId") Long companyId, @org.springframework.data.repository.query.Param("q") String q, Pageable pageable);
}
