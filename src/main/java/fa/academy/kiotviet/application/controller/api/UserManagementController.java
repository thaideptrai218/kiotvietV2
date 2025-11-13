package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.usermanagement.request.BulkStatusUpdateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.request.UserCreateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.request.UserPasswordUpdateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.request.UserUpdateRequest;
import fa.academy.kiotviet.application.dto.usermanagement.response.RoleResponse;
import fa.academy.kiotviet.application.dto.usermanagement.response.UserDetailResponse;
import fa.academy.kiotviet.application.dto.usermanagement.response.UserListItemResponse;
import fa.academy.kiotviet.application.dto.usermanagement.response.UserPageResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.shared.exception.BusinessRuleException;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.service.user.UserManagementService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
@RequiredArgsConstructor
public class UserManagementController {

    private static final int MAX_PAGE_SIZE = 100;
    private final UserManagementService userManagementService;

    @GetMapping("/users")
    public ResponseEntity<SuccessResponse<UserPageResponse>> listUsers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "all") String status,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        Pageable pageable = buildPageable(page, size);
        UserInfo.UserRole roleFilter = parseRole(role);
        Boolean statusFilter = parseStatusFilter(status);

        Page<UserInfo> result = userManagementService.searchUsers(
            principal.getCompanyId(),
            search,
            roleFilter,
            statusFilter,
            pageable
        );

        List<UserListItemResponse> content = result.getContent().stream()
            .map(this::toListItem)
            .collect(Collectors.toList());

        UserPageResponse payload = UserPageResponse.builder()
            .content(content)
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .page(pageable.getPageNumber() + 1)
            .size(pageable.getPageSize())
            .build();

        return ResponseEntity.ok(ResponseFactory.success(payload, "Users retrieved successfully"));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<SuccessResponse<UserDetailResponse>> getUser(@PathVariable Long id) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        UserInfo user = userManagementService.getUserOrThrow(id, principal.getCompanyId());
        return ResponseEntity.ok(ResponseFactory.success(toDetail(user), "User retrieved successfully"));
    }

    @PostMapping("/users")
    public ResponseEntity<SuccessResponse<Map<String, Long>>> createUser(
        @Valid @RequestBody UserCreateRequest request
    ) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        UserInfo created = userManagementService.createUser(principal.getCompanyId(), request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ResponseFactory.created(Map.of("id", created.getId()), "User created successfully"));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<SuccessResponse<UserDetailResponse>> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UserUpdateRequest request
    ) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        UserInfo updated = userManagementService.updateUser(principal.getCompanyId(), id, request);
        return ResponseEntity.ok(ResponseFactory.success(toDetail(updated), "User updated successfully"));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<SuccessResponse<Void>> changePassword(
        @PathVariable Long id,
        @Valid @RequestBody UserPasswordUpdateRequest request
    ) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        userManagementService.updatePassword(principal.getCompanyId(), id, request);
        return ResponseEntity.ok(ResponseFactory.success(null, "Password updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<SuccessResponse<Void>> deleteUser(@PathVariable Long id) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        userManagementService.deleteUser(principal.getCompanyId(), id, principal.getUserId());
        return ResponseEntity.ok(ResponseFactory.success(null, "User deleted successfully"));
    }

    @DeleteMapping("/users")
    public ResponseEntity<SuccessResponse<Void>> deleteUsers(@RequestBody List<Long> ids) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        userManagementService.deleteUsers(principal.getCompanyId(), ids, principal.getUserId());
        return ResponseEntity.ok(ResponseFactory.success(null, "Users deleted successfully"));
    }

    @PutMapping("/users/status")
    public ResponseEntity<SuccessResponse<Void>> updateStatuses(
        @Valid @RequestBody BulkStatusUpdateRequest request
    ) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        userManagementService.updateStatuses(principal.getCompanyId(), request);
        return ResponseEntity.ok(ResponseFactory.success(null, "Statuses updated successfully"));
    }

    @GetMapping("/users/export")
    public ResponseEntity<ByteArrayResource> exportUsers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "all") String status,
        @RequestParam(defaultValue = "csv") String format
    ) {
        JwtAuthenticationFilter.UserPrincipal principal = requirePrincipal();
        UserInfo.UserRole roleFilter = parseRole(role);
        Boolean statusFilter = parseStatusFilter(status);
        UserManagementService.ExportFormat exportFormat = parseExportFormat(format);

        UserManagementService.ExportResult data = userManagementService.exportUsers(
            principal.getCompanyId(),
            search,
            roleFilter,
            statusFilter,
            exportFormat
        );

        ByteArrayResource resource = new ByteArrayResource(data.getData());
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(data.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + data.getFileName() + "\"")
            .body(resource);
    }

    @GetMapping("/roles")
    public ResponseEntity<SuccessResponse<List<RoleResponse>>> listRoles() {
        List<RoleResponse> roles = Arrays.stream(UserInfo.UserRole.values())
            .map(role -> RoleResponse.builder()
                .id((long) (role.ordinal() + 1))
                .name(role.getDisplayName())
                .description(role.getDescription())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ResponseFactory.success(roles, "Roles retrieved successfully"));
    }

    private JwtAuthenticationFilter.UserPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();
    }

    private Pageable buildPageable(int page, int size) {
        int safePage = Math.max(page, 1) - 1;
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by("fullName").ascending());
    }

    private UserListItemResponse toListItem(UserInfo user) {
        return UserListItemResponse.builder()
            .id(user.getId())
            .displayName(user.getFullName())
            .username(user.getUsername())
            .phone(user.getPhone())
            .role(user.getRole().getDisplayName())
            .status(user.getIsActive() ? "Active" : "Inactive")
            .build();
    }

    private UserDetailResponse toDetail(UserInfo user) {
        return UserDetailResponse.builder()
            .id(user.getId())
            .displayName(user.getFullName())
            .username(user.getUsername())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole().getDisplayName())
            .status(user.getIsActive() ? "Active" : "Inactive")
            .birthday(user.getBirthday())
            .address(user.getAddress())
            .note(user.getNote())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    private UserInfo.UserRole parseRole(String role) {
        if (!StringUtils.hasText(role)) {
            return null;
        }
        try {
            return UserInfo.UserRole.fromValue(role.trim());
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Invalid role filter", "ROLE_INVALID");
        }
    }

    private Boolean parseStatusFilter(String status) {
        if (!StringUtils.hasText(status) || "all".equalsIgnoreCase(status)) {
            return null;
        }
        if ("active".equalsIgnoreCase(status)) {
            return true;
        }
        if ("inactive".equalsIgnoreCase(status)) {
            return false;
        }
        throw new BusinessRuleException("Invalid status filter", "STATUS_INVALID");
    }

    private UserManagementService.ExportFormat parseExportFormat(String format) {
        if (!StringUtils.hasText(format)) {
            return UserManagementService.ExportFormat.CSV;
        }
        if ("xlsx".equalsIgnoreCase(format)) {
            return UserManagementService.ExportFormat.XLSX;
        }
        if ("csv".equalsIgnoreCase(format)) {
            return UserManagementService.ExportFormat.CSV;
        }
        throw new BusinessRuleException("Invalid export format", "EXPORT_FORMAT_INVALID");
    }
}
