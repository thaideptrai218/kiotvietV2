package fa.academy.kiotviet.core.inventorycount.service;

import fa.academy.kiotviet.core.inventorycount.domain.InventoryCount;
import fa.academy.kiotviet.core.inventorycount.repository.InventoryCountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class InventoryCountCodeGenerator {

    private static final String PREFIX = "KK";
    private static final int PADDING = 6;

    private final InventoryCountRepository inventoryCountRepository;

    @Transactional(readOnly = true)
    public String nextCode(Long companyId) {
        return inventoryCountRepository.findTopByCompanyIdOrderByIdDesc(companyId)
                .map(InventoryCount::getCode)
                .map(this::incrementCode)
                .orElse(formatSequence(1));
    }

    private String incrementCode(String lastCode) {
        if (!StringUtils.hasText(lastCode)) {
            return formatSequence(1);
        }
        String digits = lastCode.replaceAll("\\D+", "");
        long sequence = 0;
        if (StringUtils.hasText(digits)) {
            try {
                sequence = Long.parseLong(digits);
            } catch (NumberFormatException ex) {
                sequence = 0;
            }
        }
        return formatSequence(sequence + 1);
    }

    private String formatSequence(long next) {
        return PREFIX + String.format("%0" + PADDING + "d", next);
    }
}

