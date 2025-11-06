package fa.academy.kiotviet.core.usermanagement.service.user;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing user CRUD operations and user-specific business logic.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserInfoRepository userInfoRepository;

    /**
     * Find user by username.
     *
     * @param username Username to search for
     * @return Optional containing user if found
     */
    public Optional<UserInfo> findByUsername(String username) {
        return userInfoRepository.findByUsername(username);
    }

    /**
     * Find user by ID within the same company context.
     *
     * @param userId User ID to search for
     * @param companyId Company ID for security context
     * @return Optional containing user if found
     */
    public Optional<UserInfo> findByIdAndCompanyId(Long userId, Long companyId) {
        return userInfoRepository.findById(userId)
                .filter(user -> user.getCompany().getId().equals(companyId));
    }

    /**
     * Save user entity with validation.
     *
     * @param user User entity to save
     * @return Saved user entity
     */
    public UserInfo save(UserInfo user) {
        return userInfoRepository.save(user);
    }

    /**
     * Get all users for a specific company.
     *
     * @param companyId Company ID
     * @return List of users in the company
     */
    public List<UserInfo> findAllByCompanyId(Long companyId) {
        return userInfoRepository.findAllByCompanyId(companyId);
    }

    /**
     * Check if username exists globally.
     *
     * @param username Username to check
     * @return true if username exists
     */
    public boolean existsByUsername(String username) {
        return userInfoRepository.existsByUsername(username);
    }

    /**
     * Check if email exists globally.
     *
     * @param email Email to check
     * @return true if email exists
     */
    public boolean existsByEmail(String email) {
        return userInfoRepository.existsByEmail(email);
    }

    /**
     * Check if username exists within a specific company.
     *
     * @param username Username to check
     * @param companyId Company ID
     * @return true if username exists in company
     */
    public boolean existsByUsernameAndCompanyId(String username, Long companyId) {
        return userInfoRepository.existsByUsernameAndCompanyId(username, companyId);
    }

    /**
     * Update user status (active/inactive).
     *
     * @param userId User ID to update
     * @param companyId Company ID for security
     * @param active New active status
     * @return Updated user if found and updated
     */
    public Optional<UserInfo> updateUserStatus(Long userId, Long companyId, boolean active) {
        return findByIdAndCompanyId(userId, companyId)
                .map(user -> {
                    user.setIsActive(active);
                    return save(user);
                });
    }
}