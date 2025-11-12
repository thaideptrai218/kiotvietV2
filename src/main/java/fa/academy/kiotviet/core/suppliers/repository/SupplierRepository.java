package fa.academy.kiotviet.core.suppliers.repository;

import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>, JpaSpecificationExecutor<Supplier> {

    Optional<Supplier> findByIdAndCompany_Id(Long id, Long companyId);

    boolean existsByCompany_IdAndNameIgnoreCase(Long companyId, String name);

    boolean existsByCompany_IdAndTaxCodeIgnoreCase(Long companyId, String taxCode);

     // Additional finder methods for flexibility/testing
     List<Supplier> findByCompany_Id(Long companyId);

     org.springframework.data.domain.Page<Supplier> findByCompany_Id(Long companyId, org.springframework.data.domain.Pageable pageable);

     List<Supplier> findByCompany_IdAndNameContainingIgnoreCase(Long companyId, String name);

     List<Supplier> findByCompany_IdAndContactPersonContainingIgnoreCase(Long companyId, String contactPerson);

     Optional<Supplier> findByCompany_IdAndTaxCodeIgnoreCase(Long companyId, String taxCode);

    @Query("select s from Supplier s " +
           "where s.company.id = :companyId and s.isActive = true and " +
           "(lower(s.name) like lower(concat('%', :q, '%')) " +
           " or lower(s.contactPerson) like lower(concat('%', :q, '%')) " +
           " or lower(s.taxCode) like lower(concat('%', :q, '%'))) " +
           "order by s.name asc")
    List<Supplier> searchAutocomplete(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);
}
