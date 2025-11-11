package fa.academy.kiotviet.core.notification;

public interface SmsService {
    void sendSms(String phone, String message);
}

