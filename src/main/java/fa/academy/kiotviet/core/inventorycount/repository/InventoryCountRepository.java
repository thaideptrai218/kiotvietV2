package fa.academy.kiotviet.core.inventorycount.repository;

import fa.academy.kiotviet.core.inventorycount.domain.InventoryCount;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryCountRepository extends JpaRepository<InventoryCount, Long>, JpaSpecificationExecutor<InventoryCount> {

    boolean existsByCompanyIdAndCodeIgnoreCase(Long companyId, String code);

    @EntityGraph(attributePaths = "items")
    Optional<InventoryCount> findDetailedByIdAndCompanyId(Long id, Long companyId);

    Optional<InventoryCount> findByIdAndCompanyId(Long id, Long companyId);

    Optional<InventoryCount> findTopByCompanyIdOrderByIdDesc(Long companyId);

    @EntityGraph(attributePaths = "items")
    List<InventoryCount> findAllByIdInAndCompanyId(List<Long> ids, Long companyId);
}
