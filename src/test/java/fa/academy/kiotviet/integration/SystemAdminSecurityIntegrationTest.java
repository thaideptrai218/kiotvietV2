package fa.academy.kiotviet.integration;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.infrastructure.security.JwtUtil;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for System Admin security features.
 * Tests route protection for /admin/** and /admin/api/** endpoints.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SystemAdminSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserInfoRepository userInfoRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Test: System admin can access admin dashboard page.
     * Expected: 200 OK
     */
    @Test
    @WithMockUser(username = "sysadmin", roles = {"system_admin"})
    void testSystemAdminCanAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/admin-dashboard"));
    }

    /**
     * Test: System admin can access admin API endpoints.
     * Expected: 200 OK
     */
    @Test
    @WithMockUser(username = "sysadmin", roles = {"system_admin"})
    void testSystemAdminCanAccessAdminApiEndpoints() throws Exception {
        mockMvc.perform(get("/admin/api/dashboard"))
                .andExpect(status().isOk());
    }

    /**
     * Test: Regular admin (not system_admin) cannot access admin dashboard.
     * Expected: 403 Forbidden
     */
    @Test
    @WithMockUser(username = "admin", roles = {"admin"})
    void testRegularAdminCannotAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    /**
     * Test: Regular admin cannot access admin API endpoints.
     * Expected: 403 Forbidden
     */
    @Test
    @WithMockUser(username = "admin", roles = {"admin"})
    void testRegularAdminCannotAccessAdminApiEndpoints() throws Exception {
        mockMvc.perform(get("/admin/api/dashboard"))
                .andExpect(status().isForbidden());
    }

    /**
     * Test: Manager role cannot access admin dashboard.
     * Expected: 403 Forbidden
     */
    @Test
    @WithMockUser(username = "manager", roles = {"manager"})
    void testManagerCannotAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    /**
     * Test: Unauthenticated user redirected to login when accessing admin dashboard.
     * Expected: 302 Redirect to /login
     */
    @Test
    void testUnauthenticatedUserRedirectedToLogin() throws Exception {
        MvcResult result = mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        // Verify redirect to login page
        String redirectedUrl = result.getResponse().getRedirectedUrl();
        assert redirectedUrl != null && redirectedUrl.contains("/login");
    }

    /**
     * Test: System admin can access company list page.
     * Expected: 200 OK
     */
    @Test
    @WithMockUser(username = "sysadmin", roles = {"system_admin"})
    void testSystemAdminCanAccessCompanyList() throws Exception {
        mockMvc.perform(get("/admin/companies"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/admin-company-list"));
    }

    /**
     * Test: System admin can access company details page.
     * Expected: 200 OK
     */
    @Test
    @WithMockUser(username = "sysadmin", roles = {"system_admin"})
    void testSystemAdminCanAccessCompanyDetails() throws Exception {
        mockMvc.perform(get("/admin/companies/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/admin-company-details"));
    }

    /**
     * Test: System admin can access user list page.
     * Expected: 200 OK
     */
    @Test
    @WithMockUser(username = "sysadmin", roles = {"system_admin"})
    void testSystemAdminCanAccessUserList() throws Exception {
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/admin-user-list"));
    }

    /**
     * Test: Regular user cannot access company list page.
     * Expected: 403 Forbidden
     */
    @Test
    @WithMockUser(username = "user", roles = {"user"})
    void testRegularUserCannotAccessCompanyList() throws Exception {
        mockMvc.perform(get("/admin/companies"))
                .andExpect(status().isForbidden());
    }

    /**
     * Test: Admin API requires system_admin role for POST requests.
     * Expected: 403 Forbidden for non-system-admin
     */
    @Test
    @WithMockUser(username = "admin", roles = {"admin"})
    void testAdminApiPostRequiresSystemAdmin() throws Exception {
        String companyJson = "{\"name\":\"Test Company\",\"email\":\"test@example.com\"}";

        mockMvc.perform(post("/admin/api/companies")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(companyJson))
                .andExpect(status().isForbidden());
    }

    /**
     * Test: System admin can POST to admin API endpoints.
     * Expected: Success (endpoint exists, may fail validation)
     */
    @Test
    @WithMockUser(username = "sysadmin", roles = {"system_admin"})
    void testSystemAdminCanPostToAdminApi() throws Exception {
        String companyJson = "{\"name\":\"Test Company\",\"email\":\"test@example.com\"}";

        // Should not get 403, may get 400 validation error or 201 success
        mockMvc.perform(post("/admin/api/companies")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(companyJson))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // Should not be 403 (forbidden), can be 201 (created) or 400 (bad request)
                    assert status != 403 : "Should not return 403 Forbidden for system admin";
                });
    }

    /**
     * Test: Verify admin API endpoints are protected.
     * Expected: 401 Unauthorized for unauthenticated requests
     */
    @Test
    void testAdminApiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/admin/api/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test: Verify regular dashboard still accessible to authenticated users.
     * Expected: 200 OK for any authenticated user
     */
    @Test
    @WithMockUser(username = "admin", roles = {"admin"})
    void testRegularDashboardAccessibleToAllAuthenticated() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/dashboard"));
    }

    /**
     * Test: Verify products endpoint accessible to regular users.
     * Expected: 200 OK for authenticated users
     */
    @Test
    @WithMockUser(username = "user", roles = {"user"})
    void testProductsAccessibleToRegularUsers() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk());
    }
}
