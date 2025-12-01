package fa.academy.kiotviet.core.orders.repository;

import fa.academy.kiotviet.core.orders.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

       Page<Order> findByCompany_Id(Long companyId, Pageable pageable);

       @Query("select o from Order o " +
                     "left join fa.academy.kiotviet.core.customers.domain.Customer c " +
                     "  on c.company.id = o.company.id and lower(c.name) = lower(o.customerName) " +
                     "where o.company.id = :companyId and " +
                     "(:status is null or o.status = :status) and " +
                     "(:fromDate is null or o.orderDate >= :fromDate) and " +
                     "(:toDate is null or o.orderDate <= :toDate) and " +
                     "(:q is null or lower(o.orderCode) like lower(concat('%', :q, '%')) or " +
                     " lower(o.customerName) like lower(concat('%', :q, '%')) or " +
                     " lower(coalesce(o.phoneNumber, c.phone)) like lower(concat('%', :q, '%'))) " +
                     "order by o.orderDate desc")
       Page<Order> search(
                     @Param("companyId") Long companyId,
                     @Param("status") Order.OrderStatus status,
                     @Param("fromDate") LocalDateTime fromDate,
                     @Param("toDate") LocalDateTime toDate,
                     @Param("q") String q,
                     Pageable pageable);

       List<Order> findByCompany_IdAndIdIn(Long companyId, Collection<Long> ids);

       // Dashboard specific queries
       @Query("select o from Order o where o.company.id = :companyId and o.orderDate between :startDate and :endDate")
       List<Order> findByCompanyIdAndOrderDateBetween(@Param("companyId") Long companyId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Query("select count(o) from Order o where o.company.id = :companyId")
       long countByCompanyId(@Param("companyId") Long companyId);

       @Query("select o.customerName as customerName, o.phoneNumber as phoneNumber, count(o) as orderCount, " +
                     "sum(o.paidAmount) as totalSpent, max(o.orderDate) as lastOrderDate " +
                     "from Order o where o.company.id = :companyId and o.status = 'COMPLETED' " +
                     "and o.customerName is not null group by o.customerName, o.phoneNumber " +
                     "order by totalSpent desc")
       List<Object[]> getTopCustomersByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

       @Query("select o.paymentMethod as paymentMethod, count(o) as transactionCount, sum(o.paidAmount) as totalAmount "
                     +
                     "from Order o where o.company.id = :companyId and o.status = 'COMPLETED' " +
                     "group by o.paymentMethod order by totalAmount desc")
       List<Object[]> getPaymentMethodStatisticsByCompanyId(@Param("companyId") Long companyId);
}
