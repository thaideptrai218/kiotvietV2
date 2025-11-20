package fa.academy.kiotviet.core.orders.service;

import fa.academy.kiotviet.application.dto.orders.request.OrderCreateItem;
import fa.academy.kiotviet.application.dto.orders.request.OrderCreateRequest;
import fa.academy.kiotviet.core.orders.domain.Order;
import fa.academy.kiotviet.core.orders.domain.OrderItem;
import fa.academy.kiotviet.core.orders.repository.OrderItemRepository;
import fa.academy.kiotviet.core.orders.repository.OrderRepository;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.repository.ProductRepository;
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
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

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

    @Transactional
    public Order create(Long companyId, OrderCreateRequest req) {
        if (req == null || req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        var order = new Order();
        order.setCompany(Company.builder().id(companyId).build());
        order.setOrderCode(generateOrderCode());
        order.setOrderDate(java.time.LocalDateTime.now());
        order.setCustomerName(trimToNull(req.getCustomerName()));
        order.setPhoneNumber(trimToNull(req.getPhoneNumber()));

        java.math.BigDecimal subtotal = java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalDiscount = java.math.BigDecimal.ZERO;

        java.util.List<OrderItem> items = new java.util.ArrayList<>();
        for (OrderCreateItem it : req.getItems()) {
            if (it == null) continue;
            int qty = Math.max(1, it.getQuantity() != null ? it.getQuantity() : 1);
            java.math.BigDecimal unit = it.getUnitPrice() != null ? it.getUnitPrice() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal disc = it.getDiscount() != null ? it.getDiscount() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal line = unit.multiply(java.math.BigDecimal.valueOf(qty));
            subtotal = subtotal.add(line);
            totalDiscount = totalDiscount.add(disc);

            Product product = null;
            if (it.getProductId() != null) {
                product = productRepository.findByIdAndCompany_Id(it.getProductId(), companyId).orElse(null);
            }

            OrderItem oi = OrderItem.builder()
                    .company(Company.builder().id(companyId).build())
                    .order(order)
                    .product(product)
                    .sku(it.getSku())
                    .productName(it.getName())
                    .quantity(qty)
                    .unitPrice(unit)
                    .discount(disc)
                    .total(line.subtract(disc))
                    .build();
            items.add(oi);
        }

        order.setSubtotal(subtotal);
        order.setDiscount(totalDiscount);
        java.math.BigDecimal total = subtotal.subtract(totalDiscount);
        java.math.BigDecimal paid = req.getPaidAmount() != null ? req.getPaidAmount() : java.math.BigDecimal.ZERO;
        order.setPaidAmount(paid);

        if (paid != null && total != null && paid.compareTo(total) >= 0) {
            order.setStatus(Order.OrderStatus.COMPLETED);
        } else {
            order.setStatus(Order.OrderStatus.DRAFT);
        }

        try {
            if (req.getPaymentMethod() != null) {
                order.setPaymentMethod(Order.PaymentMethod.valueOf(req.getPaymentMethod().trim().toUpperCase()));
            }
        } catch (Exception ignored) { }

        Order saved = orderRepository.save(order);
        for (OrderItem oi : items) {
            oi.setOrder(saved);
        }
        orderItemRepository.saveAll(items);
        return saved;
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

    private String generateOrderCode() {
        String ts = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int rnd = (int) (Math.random() * 90) + 10;
        return "DH" + ts + rnd;
    }

    private String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
