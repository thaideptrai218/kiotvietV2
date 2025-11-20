package fa.academy.kiotviet.application.dto.purchase.request;

import lombok.Data;

import java.util.List;

@Data
public class PurchaseReceiveRequest {
    @Data
    public static class ReceiveLine {
        private Long id;           // purchase line id
        private Integer qtyReceived; // quantity to receive in this call
    }

    private List<ReceiveLine> lines;
}

