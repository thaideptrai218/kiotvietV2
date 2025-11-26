package fa.academy.kiotviet.core.inventorycount.domain;

public enum InventoryCountStatus {

    DRAFT,
    COMPLETED,
    CANCELLED;

    public boolean isDraft() {
        return this == DRAFT;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED;
    }
}

