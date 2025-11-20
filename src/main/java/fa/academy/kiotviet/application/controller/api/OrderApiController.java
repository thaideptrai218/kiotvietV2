package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.orders.response.OrderListItemDto;
import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.orders.domain.Order;
import fa.academy.kiotviet.core.orders.service.OrderService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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

    @GetMapping
    public SuccessResponse<PagedResponse<OrderListItemDto>> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        Long companyId = currentCompanyId();
        Page<Order> paged = orderService.list(companyId, page, size, q, status, fromDate, toDate);
        List<OrderListItemDto> items = paged.getContent().stream().map(this::toListDto).collect(Collectors.toList());
        PagedResponse<OrderListItemDto> response = PagedResponse.of(items, paged.getNumber(), paged.getSize(), paged.getTotalElements());
        return ResponseFactory.success(response, "Orders retrieved successfully");
    }

    @DeleteMapping("/bulk")
    public SuccessResponse<String> bulkDelete(@RequestBody List<Long> ids) {
        Long companyId = currentCompanyId();
        orderService.deleteBulk(companyId, ids);
        return ResponseFactory.success("Orders deleted successfully");
    }

    private OrderListItemDto toListDto(Order o) {
        return OrderListItemDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .orderDate(o.getOrderDate())
                .customerName(o.getCustomerName())
                .phoneNumber(o.getPhoneNumber())
                .subtotal(o.getSubtotal())
                .discount(o.getDiscount())
                .paidAmount(o.getPaidAmount())
                .paymentMethod(o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null)
                .cashier(o.getCashier())
                .status(o.getStatus() != null ? o.getStatus().name() : null)
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
