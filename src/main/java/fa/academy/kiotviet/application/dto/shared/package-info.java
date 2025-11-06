/**
 * Shared DTOs used across multiple domains in the application.
 *
 * This package contains:
 * <ul>
 *   <li>{@link SuccessResponse} - Standard successful API response wrapper</li>
 *   <li>{@link ErrorResponse} - Standard error API response wrapper</li>
 *   <li>{@link PagedResponse} - Paginated response wrapper</li>
 *   <li>{@link BaseRequest} - Base class for all API requests</li>
 *   <li>{@link BaseResponse} - Base class for all API responses</li>
 *   <li>{@link common} - Common data structures used across domains</li>
 * </ul>
 *
 * <h3>Common Components:</h3>
 * <ul>
 *   <li>{@link common.UserInfoDto} - User information transfer object</li>
 *   <li>{@link common.AddressDto} - Address information transfer object</li>
 *   <li>{@link common.ContactInfoDto} - Contact information transfer object</li>
 * </ul>
 *
 * <p>These DTOs provide consistent data structures across the entire application
 * and follow standard JSON serialization patterns for REST APIs.</p>
 */
package fa.academy.kiotviet.application.dto.shared;