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

    @Query("select s from Supplier s " +
           "where s.company.id = :companyId and s.isActive = true and " +
           "(lower(s.name) like lower(concat('%', :q, '%')) or lower(s.contactPerson) like lower(concat('%', :q, '%'))) " +
           "order by s.name asc")
    List<Supplier> searchAutocomplete(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);
}
