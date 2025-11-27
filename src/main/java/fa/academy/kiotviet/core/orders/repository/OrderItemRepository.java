package fa.academy.kiotviet.core.orders.repository;

import fa.academy.kiotviet.core.orders.domain.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

       @Query("select oi.product as product, sum(oi.quantity) as totalSold, sum(oi.total) as totalRevenue " +
                     "from OrderItem oi where oi.order.company.id = :companyId and oi.order.status = 'COMPLETED' " +
                     "group by oi.product order by totalRevenue desc")
       List<Object[]> getTopProductsByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

       @Query("select oi.product.category.name as categoryName, count(distinct oi.product) as productCount, " +
                     "sum(oi.quantity) as totalSold, sum(oi.total) as totalRevenue " +
                     "from OrderItem oi where oi.order.company.id = :companyId and oi.order.status = 'COMPLETED' " +
                     "and oi.product.category is not null " +
                     "group by oi.product.category.name order by totalRevenue desc")
       List<Object[]> getTopCategoriesByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

       @Query("select sum(oi.quantity) from OrderItem oi where oi.order.company.id = :companyId " +
                     "and oi.order.orderDate between :startDate and :endDate and oi.order.status = 'COMPLETED'")
       Long getTotalItemsSoldByCompanyIdAndDateRange(@Param("companyId") Long companyId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Query("select oi.product as product, sum(oi.quantity) as totalSold, sum(oi.total) as totalRevenue " +
                     "from OrderItem oi where oi.order.company.id = :companyId " +
                     "and oi.order.orderDate between :startDateTime and :endDateTime " +
                     "and oi.order.status = 'COMPLETED' " +
                     "group by oi.product order by totalRevenue desc")
       List<Object[]> getTopProductsByCompanyIdAndDateRange(@Param("companyId") Long companyId,
                     @Param("startDateTime") LocalDateTime startDateTime,
                     @Param("endDateTime") LocalDateTime endDateTime, Pageable pageable);

       @Query("select oi.product.category.name as categoryName, count(distinct oi.product) as productCount, " +
                     "sum(oi.quantity) as totalSold, sum(oi.total) as totalRevenue " +
                     "from OrderItem oi where oi.order.company.id = :companyId " +
                     "and oi.order.orderDate between :startDateTime and :endDateTime " +
                     "and oi.order.status = 'COMPLETED' " +
                     "and oi.product.category is not null " +
                     "group by oi.product.category.name order by totalRevenue desc")
       List<Object[]> getTopCategoriesByCompanyIdAndDateRange(@Param("companyId") Long companyId,
                     @Param("startDateTime") LocalDateTime startDateTime,
                     @Param("endDateTime") LocalDateTime endDateTime, Pageable pageable);
}
