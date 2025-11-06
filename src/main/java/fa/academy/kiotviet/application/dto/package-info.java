/**
 * Data Transfer Objects (DTOs) for the KiotViet application.
 *
 * This package contains DTOs organized by their purpose and domain:
 *
 * <h2>Package Structure:</h2>
 * <ul>
 *   <li>{@link shared} - Common DTOs used across multiple domains</li>
 *   <li>{@link auth} - Authentication and authorization DTOs</li>
 *   <li>{@link form} - Form objects for HTML page submissions</li>
 *   <li>{@link user} - User management DTOs</li>
 *   <li>{@link product} - Product catalog DTOs</li>
 *   <li>{@link inventory} - Inventory management DTOs</li>
 * </ul>
 *
 * <h2>DTO Types:</h2>
 * <ul>
 *   <li><strong>Request DTOs</strong> - Incoming API requests (JSON payloads)</li>
 *   <li><strong>Response DTOs</strong> - Outgoing API responses (JSON data)</li>
 *   <li><strong>Form DTOs</strong> - HTML form submissions with validation</li>
 *   <li><strong>Shared DTOs</strong> - Reusable components across domains</li>
 * </ul>
 *
 * <h2>Usage Guidelines:</h2>
 * <ul>
 *   <li>API Controllers use Request/Response DTOs</li>
 *   <li>Web Controllers use Form DTOs</li>
 *   <li>Shared DTOs can be used by both API and Web layers</li>
 *   <li>All DTOs should have proper validation annotations</li>
 *   <li>Use builder pattern for immutability and readability</li>
 * </ul>
 *
 * @see shared.SuccessResponse
 * @see shared.ErrorResponse
 * @see auth.request.RegistrationRequest
 * @see auth.response.AuthResponse
 * @see form.RegistrationForm
 */
package fa.academy.kiotviet.application.dto;