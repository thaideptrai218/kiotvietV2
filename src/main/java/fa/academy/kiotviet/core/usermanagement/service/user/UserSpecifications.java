package fa.academy.kiotviet.core.usermanagement.service.user;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo.UserRole;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * Helper specifications for filtering users in repositories.
 */
public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<UserInfo> withFilters(Long companyId, String search, UserRole role, Boolean isActive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("company").get("id"), companyId));

            if (StringUtils.hasText(search)) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate byName = cb.like(lowerOrEmpty(root.get("fullName"), cb), likePattern);
                Predicate byUsername = cb.like(lowerOrEmpty(root.get("username"), cb), likePattern);
                Predicate byEmail = cb.like(lowerOrEmpty(root.get("email"), cb), likePattern);
                Predicate byPhone = cb.like(lowerOrEmpty(root.get("phone"), cb), likePattern);
                predicates.add(cb.or(byName, byUsername, byEmail, byPhone));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static Expression<String> lowerOrEmpty(Expression<String> expression, jakarta.persistence.criteria.CriteriaBuilder cb) {
        return cb.lower(cb.coalesce(expression, ""));
    }
}
