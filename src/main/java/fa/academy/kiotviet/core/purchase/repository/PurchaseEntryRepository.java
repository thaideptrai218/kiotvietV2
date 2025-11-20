package fa.academy.kiotviet.core.purchase.repository;

import fa.academy.kiotviet.core.purchase.domain.PurchaseEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseEntryRepository extends JpaRepository<PurchaseEntry, Long>, JpaSpecificationExecutor<PurchaseEntry> {
    Optional<PurchaseEntry> findByIdAndCompany_Id(Long id, Long companyId);
    Page<PurchaseEntry> findByCompany_Id(Long companyId, Pageable pageable);
    boolean existsByCompany_IdAndCodeIgnoreCase(Long companyId, String code);
}

