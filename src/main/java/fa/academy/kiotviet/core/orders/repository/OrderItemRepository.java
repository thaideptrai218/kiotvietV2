package fa.academy.kiotviet.core.orders.repository;

import fa.academy.kiotviet.core.orders.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    java.util.List<OrderItem> findByOrder_IdAndCompany_Id(Long orderId, Long companyId);
    void deleteByOrder_IdAndCompany_Id(Long orderId, Long companyId);
}
