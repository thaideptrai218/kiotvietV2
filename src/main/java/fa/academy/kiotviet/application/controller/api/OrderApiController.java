package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.orders.request.OrderCreateRequest;
import fa.academy.kiotviet.application.dto.orders.response.OrderDetailDto;
import fa.academy.kiotviet.application.dto.orders.response.OrderItemDetailDto;
import fa.academy.kiotviet.application.dto.orders.response.OrderCreateResponse;
import fa.academy.kiotviet.application.dto.orders.response.OrderListItemDto;
import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.orders.domain.Order;
import fa.academy.kiotviet.core.orders.service.OrderService;
import fa.academy.kiotviet.core.orders.repository.OrderItemRepository;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderApiController {

    private final OrderService orderService;
    private final OrderItemRepository orderItemRepository;

    @GetMapping
    public SuccessResponse<PagedResponse<OrderListItemDto>> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            // Purchases-style aliases
            @RequestParam(required = false, name = "search") String search,
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
            @RequestParam(required = false, name = "from") java.time.LocalDate from,
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
            @RequestParam(required = false, name = "to") java.time.LocalDate to
    ) {
        Long companyId = currentCompanyId();
        // Allow purchases-style params: search, from, to
        String effectiveQ = (q != null && !q.isBlank()) ? q : (search != null && !search.isBlank() ? search : null);
        String effectiveFrom = fromDate;
        String effectiveTo = toDate;
        if ((effectiveFrom == null || effectiveFrom.isBlank()) && from != null) effectiveFrom = from.toString();
        if ((effectiveTo == null || effectiveTo.isBlank()) && to != null) effectiveTo = to.toString();
        Page<Order> paged = orderService.list(companyId, page, size, effectiveQ, status, effectiveFrom, effectiveTo);
        List<OrderListItemDto> items = paged.getContent().stream().map(this::toListDto).collect(Collectors.toList());
        PagedResponse<OrderListItemDto> response = PagedResponse.of(items, paged.getNumber(), paged.getSize(), paged.getTotalElements());
        return ResponseFactory.success(response, "Orders retrieved successfully");
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('ORDER_MANAGE')")
    public SuccessResponse<String> bulkDelete(@RequestBody List<Long> ids) {
        Long companyId = currentCompanyId();
        orderService.deleteBulk(companyId, ids);
        return ResponseFactory.success("Orders deleted successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('ORDER_MANAGE')")
    public SuccessResponse<OrderCreateResponse> createOrder(@RequestBody OrderCreateRequest request) {
        Long companyId = currentCompanyId();
        Order saved = orderService.create(companyId, request);
        var total = saved.getSubtotal().subtract(saved.getDiscount());
        OrderCreateResponse resp = OrderCreateResponse.builder()
                .id(saved.getId())
                .orderCode(saved.getOrderCode())
                .status(saved.getStatus() != null ? saved.getStatus().name() : null)
                .orderDate(saved.getOrderDate())
                .subtotal(saved.getSubtotal())
                .discount(saved.getDiscount())
                .total(total)
                .paidAmount(saved.getPaidAmount())
                .build();
        return ResponseFactory.created(resp, "Order created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('ORDER_MANAGE')")
    public SuccessResponse<OrderCreateResponse> updateOrder(@PathVariable Long id, @RequestBody OrderCreateRequest request) {
        Long companyId = currentCompanyId();
        Order saved = orderService.update(companyId, id, request);
        var total = saved.getSubtotal().subtract(saved.getDiscount());
        OrderCreateResponse resp = OrderCreateResponse.builder()
                .id(saved.getId())
                .orderCode(saved.getOrderCode())
                .status(saved.getStatus() != null ? saved.getStatus().name() : null)
                .orderDate(saved.getOrderDate())
                .subtotal(saved.getSubtotal())
                .discount(saved.getDiscount())
                .total(total)
                .paidAmount(saved.getPaidAmount())
                .build();
        return ResponseFactory.success(resp, "Order updated successfully");
    }

    @GetMapping("/{id}/detail")
    public SuccessResponse<OrderDetailDto> getOrderDetail(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Order o = orderService.getById(companyId, id);

        java.math.BigDecimal zero = java.math.BigDecimal.ZERO;
        java.math.BigDecimal sub = o.getSubtotal() != null ? o.getSubtotal() : zero;
        java.math.BigDecimal disc = o.getDiscount() != null ? o.getDiscount() : zero;
        java.math.BigDecimal total = sub.subtract(disc);
        if (total.compareTo(zero) < 0) total = zero;
        java.math.BigDecimal pays = o.getPaidAmount() != null ? o.getPaidAmount() : zero;
        java.math.BigDecimal remaining = total.subtract(pays);

        java.math.BigDecimal discountPercent = sub.compareTo(zero) > 0 ?
                disc.multiply(new java.math.BigDecimal("100")).divide(sub, 2, java.math.RoundingMode.HALF_UP) : zero;

        var items = orderItemRepository.findByOrder_IdAndCompany_Id(id, companyId);
        java.util.List<OrderItemDetailDto> itemDtos = new java.util.ArrayList<>();
        for (var it : items) {
            java.math.BigDecimal unit = it.getUnitPrice() != null ? it.getUnitPrice() : zero;
            java.math.BigDecimal d = it.getDiscount() != null ? it.getDiscount() : zero;
            java.math.BigDecimal sale = unit.subtract(d);
            if (sale.compareTo(zero) < 0) sale = zero;
            int qty = it.getQuantity() != null ? it.getQuantity() : 0;
            java.math.BigDecimal lineTotal = sale.multiply(new java.math.BigDecimal(qty));
            itemDtos.add(OrderItemDetailDto.builder()
                    .productCode(it.getSku())
                    .productName(it.getProductName())
                    .quantity(qty)
                    .unitPrice(unit)
                    .discount(d)
                    .salePrice(sale)
                    .total(lineTotal)
                    .build());
        }

        OrderDetailDto dto = OrderDetailDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .orderDate(o.getOrderDate())
                .customerName(o.getCustomerName())
                .phoneNumber(o.getPhoneNumber())
                .status(o.getStatus() != null ? o.getStatus().name() : "DRAFT")
                .paymentMethod(o.getPaymentMethod() != null ? o.getPaymentMethod().name() : "")
                .branchName("")
                .creator(o.getCashier())
                .seller(o.getCashier())
                .note(o.getNote())
                .subtotal(sub)
                .discountPercent(discountPercent)
                .discountAmount(disc)
                .total(total)
                .customerPays(pays)
                .remainingAmount(remaining)
                .paidAmount(pays)
                .items(itemDtos)
                .build();

        return ResponseFactory.success(dto, "Order detail retrieved");
    }

    private OrderListItemDto toListDto(Order o) {
        java.math.BigDecimal zero = java.math.BigDecimal.ZERO;
        java.math.BigDecimal sub = o.getSubtotal() != null ? o.getSubtotal() : zero;
        java.math.BigDecimal disc = o.getDiscount() != null ? o.getDiscount() : zero;
        java.math.BigDecimal total = sub.subtract(disc);
        if (total.compareTo(zero) < 0) total = zero;
        return OrderListItemDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .orderDate(o.getOrderDate())
                .customerName(o.getCustomerName())
                .phoneNumber(o.getPhoneNumber())
                .subtotal(sub)
                .discount(disc)
                .paidAmount(o.getPaidAmount() != null ? o.getPaidAmount() : zero)
                .totalAmount(total)
                .paymentMethod(o.getPaymentMethod() != null ? o.getPaymentMethod().name() : "")
                .cashier(o.getCashier())
                .status(o.getStatus() != null ? o.getStatus().name() : "DRAFT")
                .build();
    }

    private Long currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        JwtAuthenticationFilter.UserPrincipal principal = (JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal();
        return principal.getCompanyId();
    }
}
