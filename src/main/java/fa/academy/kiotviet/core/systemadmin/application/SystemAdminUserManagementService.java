package fa.academy.kiotviet.core.systemadmin.application;

import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminUserCreateDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminUserListDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminUserUpdateDTO;
import fa.academy.kiotviet.core.systemadmin.exception.UserNotFoundException;
import fa.academy.kiotviet.core.systemadmin.exception.CompanyNotFoundException;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing users across all tenants (System Admin)
 * Provides CRUD operations without tenant filtering
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SystemAdminUserManagementService {

    private final UserInfoRepository userInfoRepository;
    private final CompanyRepository companyRepository;

    /**
     * Get all users with pagination (cross-tenant query)
     * Supports optional filtering by role, companyId, status, and keyword search
     */
    public Page<SystemAdminUserListDTO> getAllUsers(Pageable pageable, String role, Long companyId, String status, String keyword) {
        log.info("System Admin: Fetching all users with pagination - role: {}, companyId: {}, status: {}, keyword: {}",
                role, companyId, status, keyword);

        List<UserInfo> allUsers = userInfoRepository.findAll();

        // Normalize role filter to match enum values
        final String normalizedRole = normalizeRoleFilter(role);

        // Apply filters
        List<UserInfo> filteredUsers = allUsers.stream()
                // Filter by role
                .filter(user -> {
                    if (normalizedRole == null) return true;
                    return user.getRole() != null && user.getRole().name().equals(normalizedRole);
                })
                // Filter by companyId
                .filter(user -> {
                    if (companyId == null) return true;
                    return user.getCompany() != null && companyId.equals(user.getCompany().getId());
                })
                // Filter by status
                .filter(user -> {
                    if (status == null || status.isEmpty()) return true;
                    boolean isActive = user.getIsActive() != null ? user.getIsActive() : true;
                    if ("active".equalsIgnoreCase(status)) return isActive;
                    if ("inactive".equalsIgnoreCase(status)) return !isActive;
                    return true;
                })
                // Filter by keyword (search in username, email, fullName)
                .filter(user -> {
                    if (keyword == null || keyword.isEmpty()) return true;
                    String lowerKeyword = keyword.toLowerCase();
                    return (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowerKeyword))
                            || (user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerKeyword))
                            || (user.getFullName() != null && user.getFullName().toLowerCase().contains(lowerKeyword));
                })
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filteredUsers.size());
        List<UserInfo> pagedUsers = start < filteredUsers.size() ? filteredUsers.subList(start, end) : List.of();

        return new org.springframework.data.domain.PageImpl<>(
                pagedUsers.stream().map(user -> SystemAdminUserListDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .companyName(user.getCompany() != null ? user.getCompany().getName() : "N/A")
                        .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                        .isActive(user.getIsActive())
                        .lastLoginAt(null) // TODO: Implement when UserAuth has last_login_at
                        .createdAt(user.getCreatedAt())
                        .build())
                        .collect(Collectors.toList()),
                pageable,
                filteredUsers.size()
        );
    }

    /**
     * Normalize role filter string to match UserRole enum values
     * Handles both ROLE_* format and simple name format
     */
    private String normalizeRoleFilter(String role) {
        if (role == null || role.isEmpty()) {
            return null;
        }

        // Handle both ROLE_* format and simple name format
        String normalizedRole = role.replace("ROLE_", "").toUpperCase();

        // Map common role names to enum values
        return switch (normalizedRole) {
            case "COMPANY_ADMIN" -> "ADMIN";
            case "SYSTEM_ADMIN" -> "SYSTEM_ADMIN";
            case "USER" -> "USER";
            case "MANAGER" -> "MANAGER";
            default -> normalizedRole;
        };
    }

    /**
     * Get users by company ID
     */
    public Page<SystemAdminUserListDTO> getUsersByCompany(Long companyId, Pageable pageable) {
        log.info("System Admin: Fetching users for company ID: {}", companyId);

        if (!companyRepository.existsById(companyId)) {
            throw new CompanyNotFoundException(companyId);
        }

        return userInfoRepository.findAllByCompanyId(companyId)
                .stream()
                .map(user -> SystemAdminUserListDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .companyName(user.getCompany() != null ? user.getCompany().getName() : "N/A")
                        .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                        .isActive(user.getIsActive())
                        .lastLoginAt(null)
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList())
                .stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
                ));
    }

    /**
     * Get detailed information about a specific user
     */
    @Transactional(readOnly = true)
    public SystemAdminUserListDTO getUserDetails(Long userId) {
        log.info("System Admin: Fetching details for user ID: {}", userId);

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        return SystemAdminUserListDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .companyName(user.getCompany() != null ? user.getCompany().getName() : "N/A")
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .isActive(user.getIsActive())
                .lastLoginAt(null)
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Create a new user (system admin only)
     */
    @Transactional
    public SystemAdminUserListDTO createUser(SystemAdminUserCreateDTO dto) {
        log.info("System Admin: Creating new user with username: {}", dto.getUsername());

        // Validate company exists
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new CompanyNotFoundException(dto.getCompanyId()));

        // Check if username already exists globally
        if (userInfoRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username " + dto.getUsername() + " already exists");
        }

        // Check if email already exists globally
        if (userInfoRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email " + dto.getEmail() + " already exists");
        }

        UserInfo user = new UserInfo();
        user.setCompany(company);
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setIsActive(dto.getIsActive());

        UserInfo savedUser = userInfoRepository.save(user);

        // TODO: Create UserAuth entry with password hash using encodedPassword
        log.info("System Admin: User created successfully with ID: {}", savedUser.getId());

        return getUserDetails(savedUser.getId());
    }

    /**
     * Update user information (system admin only)
     */
    @Transactional
    public SystemAdminUserListDTO updateUser(Long userId, SystemAdminUserUpdateDTO dto) {
        log.info("System Admin: Updating user ID: {}", userId);

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Check email uniqueness if email is being changed
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userInfoRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email " + dto.getEmail() + " already exists");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getAddress() != null) {
            user.setAddress(dto.getAddress());
        }
        if (dto.getNote() != null) {
            user.setNote(dto.getNote());
        }
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }

        UserInfo savedUser = userInfoRepository.save(user);

        log.info("System Admin: User ID {} updated successfully", userId);

        return getUserDetails(savedUser.getId());
    }

    /**
     * Delete a user (system admin only)
     */
    @Transactional
    public void deleteUser(Long userId) {
        log.info("System Admin: Deleting user ID: {}", userId);

        if (!userInfoRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        userInfoRepository.deleteById(userId);

        log.info("System Admin: User ID {} deleted successfully", userId);
    }

    /**
     * Activate a user
     */
    @Transactional
    public void activateUser(Long userId) {
        log.info("System Admin: Activating user ID: {}", userId);

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setIsActive(true);
        userInfoRepository.save(user);

        log.info("System Admin: User ID {} activated successfully", userId);
    }

    /**
     * Deactivate a user
     */
    @Transactional
    public void deactivateUser(Long userId) {
        log.info("System Admin: Deactivating user ID: {}", userId);

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setIsActive(false);
        userInfoRepository.save(user);

        log.info("System Admin: User ID {} deactivated successfully", userId);
    }

    /**
     * Search users by username, email, or name (cross-tenant query)
     */
    @Transactional(readOnly = true)
    public List<SystemAdminUserListDTO> searchUsers(String keyword) {
        log.info("System Admin: Searching users with keyword: {}", keyword);

        return userInfoRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(keyword.toLowerCase())
                        || user.getEmail().toLowerCase().contains(keyword.toLowerCase())
                        || (user.getFullName() != null && user.getFullName().toLowerCase().contains(keyword.toLowerCase())))
                .map(user -> SystemAdminUserListDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .companyName(user.getCompany() != null ? user.getCompany().getName() : "N/A")
                        .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                        .isActive(user.getIsActive())
                        .lastLoginAt(null)
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
