package fa.academy.kiotviet.core.usermanagement.service.user;

import fa.academy.kiotviet.application.dto.usermanagement.request.BulkStatusUpdateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.request.UserCreateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.request.UserPasswordUpdateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.request.UserUpdateRequest;
import fa.academy.kiotviet.core.shared.exception.BusinessRuleException;
import fa.academy.kiotviet.core.shared.exception.ConflictException;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo.UserRole;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
    private final CompanyRepository companyRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserInfo> searchUsers(Long companyId, String search, UserRole role, Boolean active, Pageable pageable) {
        log.debug("Searching users company={}, search={}, role={}, active={}", companyId, search, role, active);
        return userInfoRepository.findAll(UserSpecifications.withFilters(companyId, normalize(search), role, active), pageable);
    }

    @Transactional(readOnly = true)
    public UserInfo getUserOrThrow(Long id, Long companyId) {
        return userInfoRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found", "USER_NOT_FOUND"));
    }

    @Transactional
    public UserInfo createUser(Long companyId, UserCreateRequest request) {
        validateUsernameAvailability(request.getUsername(), companyId, null);
        validateEmailAvailability(request.getEmail(), companyId, null);

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found", "COMPANY_NOT_FOUND"));

        UserInfo user = new UserInfo();
        user.setCompany(company);
        applyCommonFields(user, request.getDisplayName(), request.getUsername(), request.getEmail(),
            request.getPhone(), request.getRole(), request.getStatus(), request.getBirthday(),
            request.getAddress(), request.getNote());

        UserInfo saved = userInfoRepository.save(user);
        persistPassword(saved, request.getPassword());
        return saved;
    }

    @Transactional
    public UserInfo updateUser(Long companyId, Long userId, UserUpdateRequest request) {
        UserInfo user = getUserOrThrow(userId, companyId);

        validateUsernameAvailability(request.getUsername(), companyId, userId);
        validateEmailAvailability(request.getEmail(), companyId, userId);

        applyCommonFields(user, request.getDisplayName(), request.getUsername(), request.getEmail(),
            request.getPhone(), request.getRole(), request.getStatus(), request.getBirthday(),
            request.getAddress(), request.getNote());

        UserInfo saved = userInfoRepository.save(user);
        if (StringUtils.hasText(request.getPassword())) {
            persistPassword(saved, request.getPassword());
        }
        return saved;
    }

    @Transactional
    public void updatePassword(Long companyId, Long userId, UserPasswordUpdateRequest request) {
        UserInfo user = getUserOrThrow(userId, companyId);
        persistPassword(user, request.getPassword());
    }

    @Transactional
    public void deleteUser(Long companyId, Long userId, Long currentUserId) {
        if (userId.equals(currentUserId)) {
            throw new BusinessRuleException("Cannot delete your own account.", "SELF_DELETE");
        }
        UserInfo user = getUserOrThrow(userId, companyId);
        userInfoRepository.delete(user);
    }

    @Transactional
    public void deleteUsers(Long companyId, List<Long> ids, Long currentUserId) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessRuleException("No user ids provided", "EMPTY_IDS");
        }
        if (ids.contains(currentUserId)) {
            throw new BusinessRuleException("Cannot delete your own account.", "SELF_DELETE");
        }

        List<UserInfo> users = userInfoRepository.findAllByIdInAndCompanyId(ids, companyId);
        if (users.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more users not found", "USER_NOT_FOUND");
        }
        userInfoRepository.deleteAll(users);
    }

    @Transactional
    public void updateStatuses(Long companyId, BulkStatusUpdateRequest request) {
        if (request.getIds() == null || request.getIds().isEmpty()) {
            throw new BusinessRuleException("No user ids provided", "EMPTY_IDS");
        }

        boolean newStatus = resolveStatusFlag(request.getStatus(), false);
        List<UserInfo> users = userInfoRepository.findAllByIdInAndCompanyId(request.getIds(), companyId);
        if (users.size() != request.getIds().size()) {
            throw new ResourceNotFoundException("One or more users not found", "USER_NOT_FOUND");
        }

        users.forEach(user -> user.setIsActive(newStatus));
        userInfoRepository.saveAll(users);
    }

    @Transactional(readOnly = true)
    public ExportResult exportUsers(Long companyId, String search, UserRole role, Boolean active, ExportFormat format) {
        List<UserInfo> users = userInfoRepository.findAll(
            UserSpecifications.withFilters(companyId, normalize(search), role, active),
            Sort.by(Sort.Direction.ASC, "fullName"));

        return switch (format) {
            case XLSX -> buildXlsx(users);
            case CSV -> buildCsv(users);
        };
    }

    private void applyCommonFields(
        UserInfo user,
        String displayName,
        String username,
        String email,
        String phone,
        String role,
        String status,
        java.time.LocalDate birthday,
        String address,
        String note
    ) {
        user.setFullName(displayName);
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(resolveRole(role));
        user.setIsActive(resolveStatusFlag(status, true));
        user.setBirthday(birthday);
        user.setAddress(address);
        user.setNote(note);
    }

    private void persistPassword(UserInfo user, String rawPassword) {
        if (!StringUtils.hasText(rawPassword)) {
            throw new BusinessRuleException("Password is required", "PASSWORD_REQUIRED");
        }

        UserAuth auth = userAuthRepository.findByUserId(user.getId())
            .orElseGet(() -> {
                UserAuth ua = new UserAuth();
                ua.setUser(user);
                return ua;
            });

        String salt = generateSalt();
        auth.setSalt(salt);
        auth.setPasswordHash(passwordEncoder.encode(rawPassword + salt));
        auth.setFailedAttempts(0);
        userAuthRepository.save(auth);
    }

    private void validateUsernameAvailability(String username, Long companyId, Long excludeId) {
        boolean exists = excludeId == null
            ? userInfoRepository.existsByUsernameAndCompanyId(username, companyId)
            : userInfoRepository.existsByUsernameAndCompanyIdAndIdNot(username, companyId, excludeId);

        if (exists) {
            throw new ConflictException("Username already exists", "USERNAME_EXISTS");
        }
    }

    private void validateEmailAvailability(String email, Long companyId, Long excludeId) {
        boolean exists = excludeId == null
            ? userInfoRepository.existsByEmailAndCompanyId(email, companyId)
            : userInfoRepository.existsByEmailAndCompanyIdAndIdNot(email, companyId, excludeId);

        if (exists) {
            throw new ConflictException("Email already exists", "EMAIL_EXISTS");
        }
    }

    private UserRole resolveRole(String role) {
        if (!StringUtils.hasText(role)) {
            throw new BusinessRuleException("Role is required", "ROLE_REQUIRED");
        }
        try {
            return UserRole.fromValue(role.trim());
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Invalid role value", "ROLE_INVALID");
        }
    }

    private boolean resolveStatusFlag(String status, boolean defaultActiveIfBlank) {
        if (!StringUtils.hasText(status)) {
            if (defaultActiveIfBlank) {
                return true;
            }
            throw new BusinessRuleException("Status is required", "STATUS_REQUIRED");
        }
        if ("active".equalsIgnoreCase(status)) {
            return true;
        }
        if ("inactive".equalsIgnoreCase(status)) {
            return false;
        }
        if (defaultActiveIfBlank && "all".equalsIgnoreCase(status)) {
            return true;
        }
        throw new BusinessRuleException("Invalid status value", "STATUS_INVALID");
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String generateSalt() {
        byte[] saltBytes = new byte[16];
        new SecureRandom().nextBytes(saltBytes);
        return Base64.getEncoder().encodeToString(saltBytes);
    }

    private ExportResult buildCsv(List<UserInfo> users) {
        StringBuilder builder = new StringBuilder();
        builder.append("Display Name,Username,Phone,Role,Status").append("\n");
        for (UserInfo user : users) {
            builder.append(safeCsv(user.getFullName())).append(',')
                .append(safeCsv(user.getUsername())).append(',')
                .append(safeCsv(user.getPhone())).append(',')
                .append(safeCsv(user.getRole().getDisplayName())).append(',')
                .append(user.getIsActive() ? "Active" : "Inactive").append('\n');
        }
        byte[] bytes = builder.toString().getBytes(StandardCharsets.UTF_8);
        return new ExportResult(bytes, "text/csv",
            "users-" + UUID.randomUUID() + ".csv");
    }

    private ExportResult buildXlsx(List<UserInfo> users) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Users");
            createHeaderRow(sheet);
            int rowIndex = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (UserInfo user : users) {
                Row row = sheet.createRow(rowIndex++);
                createCell(row, 0, user.getFullName());
                createCell(row, 1, user.getUsername());
                createCell(row, 2, user.getPhone());
                createCell(row, 3, user.getRole().getDisplayName());
                createCell(row, 4, user.getIsActive() ? "Active" : "Inactive");
                createCell(row, 5, user.getBirthday() != null ? user.getBirthday().format(formatter) : "");
                createCell(row, 6, user.getEmail());
            }

            for (int i = 0; i <= 6; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ExportResult(out.toByteArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "users-" + UUID.randomUUID() + ".xlsx");
        } catch (Exception ex) {
            throw new BusinessRuleException("Failed to export users", "EXPORT_FAILED");
        }
    }

    private void createHeaderRow(XSSFSheet sheet) {
        Row header = sheet.createRow(0);
        String[] headers = {"Display Name", "Username", "Phone", "Role", "Status", "Birthday", "Email"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
        }
    }

    private void createCell(Row row, int column, String value) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
    }

    private String safeCsv(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    public enum ExportFormat {
        CSV, XLSX
    }

    @Value
    public static class ExportResult {
        byte[] data;
        String contentType;
        String fileName;
    }
}
