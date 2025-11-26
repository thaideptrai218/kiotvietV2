package fa.academy.kiotviet.core.inventorycount.repository;

import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryCountItemRepository extends JpaRepository<InventoryCountItem, Long> {

    Optional<InventoryCountItem> findByIdAndCompanyId(Long id, Long companyId);
}

