package fa.academy.kiotviet.core.inventorycount.repository;

import fa.academy.kiotviet.core.inventorycount.domain.InventoryCount;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class InventoryCountSpecifications {

    private InventoryCountSpecifications() {
    }

    public static Specification<InventoryCount> belongsToCompany(Long companyId) {
        return (root, query, builder) -> builder.equal(root.get("companyId"), companyId);
    }

    public static Specification<InventoryCount> codeContains(String code) {
        if (!StringUtils.hasText(code)) {
            return null;
        }
        String likeExpression = "%" + code.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.like(builder.lower(root.get("code")), likeExpression);
    }

    public static Specification<InventoryCount> hasStatus(InventoryCountStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get("status"), status);
    }

    public static Specification<InventoryCount> createdBy(Long creatorId) {
        if (creatorId == null) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get("createdBy"), creatorId);
    }

    public static Specification<InventoryCount> createdFrom(LocalDate fromDate) {
        if (fromDate == null) {
            return null;
        }
        LocalDateTime start = fromDate.atStartOfDay();
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("createdAt"), start);
    }

    public static Specification<InventoryCount> createdTo(LocalDate toDate) {
        if (toDate == null) {
            return null;
        }
        LocalDateTime end = toDate.atTime(LocalTime.MAX);
        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get("createdAt"), end);
    }
}

