package fa.academy.kiotviet.core.notification.impl;

import fa.academy.kiotviet.core.notification.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ConsoleSmsService implements SmsService {
    @Override
    public void sendSms(String phone, String message) {
        log.info("[SMS] to {} => {}", phone, message);
    }
}

