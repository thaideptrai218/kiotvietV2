package fa.academy.kiotviet.core.orders.repository;

import fa.academy.kiotviet.core.orders.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Page<Order> findByCompany_Id(Long companyId, Pageable pageable);

    @Query("select o from Order o where o.company.id = :companyId and " +
           "(:status is null or o.status = :status) and " +
           "(:fromDate is null or o.orderDate >= :fromDate) and " +
           "(:toDate is null or o.orderDate <= :toDate) and " +
           "(:q is null or lower(o.orderCode) like lower(concat('%', :q, '%')) or " +
           " lower(o.customerName) like lower(concat('%', :q, '%')) or " +
           " lower(o.phoneNumber) like lower(concat('%', :q, '%'))) " +
           "order by o.orderDate desc")
    Page<Order> search(
            @Param("companyId") Long companyId,
            @Param("status") Order.OrderStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("q") String q,
            Pageable pageable);

    List<Order> findByCompany_IdAndIdIn(Long companyId, Collection<Long> ids);
}

