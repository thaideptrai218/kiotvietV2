package fa.academy.kiotviet.core.orders.service;

import fa.academy.kiotviet.core.orders.domain.Order;
import fa.academy.kiotviet.core.orders.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Page<Order> list(Long companyId, int page, int size, String q, String status, String fromDate, String toDate) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        Order.OrderStatus st = null;
        if (status != null && !status.isBlank()) {
            try { st = Order.OrderStatus.valueOf(status.trim().toUpperCase()); } catch (Exception ignored) { }
        }

        LocalDateTime from = parseDate(fromDate, true);
        LocalDateTime to = parseDate(toDate, false);
        String query = (q != null && !q.isBlank()) ? q.trim() : null;
        return orderRepository.search(companyId, st, from, to, query, pageable);
    }

    @Transactional
    public void deleteBulk(Long companyId, List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        var orders = orderRepository.findByCompany_IdAndIdIn(companyId, ids);
        orderRepository.deleteAll(orders);
    }

    private LocalDateTime parseDate(String str, boolean startOfDay) {
        if (str == null || str.isBlank()) return null;
        try {
            // Accept ISO date or yyyy-MM-dd
            if (str.length() <= 10) {
                LocalDate d = LocalDate.parse(str, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                return startOfDay ? d.atStartOfDay() : d.atTime(23,59,59);
            }
            return LocalDateTime.parse(str);
        } catch (Exception e) {
            return null;
        }
    }
}

