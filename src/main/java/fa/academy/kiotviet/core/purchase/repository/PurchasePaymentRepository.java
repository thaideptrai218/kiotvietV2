package fa.academy.kiotviet.core.purchase.repository;

import fa.academy.kiotviet.core.purchase.domain.PurchasePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchasePaymentRepository extends JpaRepository<PurchasePayment, Long> {
}

