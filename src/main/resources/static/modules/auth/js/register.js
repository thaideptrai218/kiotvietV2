/**
 * Registration Form JavaScript
 * Handles multi-step registration with validation and UX enhancements
 */

class RegistrationForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.form = document.getElementById('registrationForm');
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress(1);
        this.setupValidation();
        this.setupPasswordStrength();
    }

    bindEvents() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Clear errors on input
        document.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', () => this.clearFieldError(field));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.handleQuickSubmit();
            }
        });

        // Auto-focus management
        this.setupAutoFocus();
    }

    setupValidation() {
        // Real-time validation
        const emailFields = document.querySelectorAll('input[data-validation*="email"]');
        emailFields.forEach(field => {
            field.addEventListener('blur', () => this.validateEmail(field));
        });

        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.addEventListener('blur', () => this.validateUsername(usernameField));
        }

        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('blur', () => this.validatePassword(passwordField));
        }
    }

    setupPasswordStrength() {
        const passwordField = document.getElementById('password');
        const strengthIndicator = document.getElementById('passwordStrength');

        if (!passwordField || !strengthIndicator) return;

        passwordField.addEventListener('input', (e) => {
            const password = e.target.value;
            this.updatePasswordStrength(password, strengthIndicator);
        });
    }

    setupAutoFocus() {
        // Focus first field on load
        const firstField = document.querySelector('#step1Collapse input');
        if (firstField) {
            setTimeout(() => firstField.focus(), 100);
        }

        // Focus management for step transitions
        this.setupStepFocus();
    }

    setupStepFocus() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('show')) {
                        const firstInput = target.querySelector('input, textarea');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 300);
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.accordion-collapse').forEach(collapse => {
            observer.observe(collapse, { attributes: true });
        });
    }

    // Step Navigation
    goToStep(step) {
        if (step < 1 || step > this.totalSteps) return;

        // Hide all steps
        document.querySelectorAll('.accordion-collapse').forEach(collapse => {
            const bsCollapse = bootstrap.Collapse.getInstance(collapse);
            if (bsCollapse) {
                bsCollapse.hide();
            }
        });

        // Show target step
        const targetCollapse = document.getElementById(`step${step}Collapse`);
        if (targetCollapse) {
            const bsCollapse = new bootstrap.Collapse(targetCollapse, {
                show: true
            });
        }

        // Update progress indicators
        this.updateProgress(step);
        this.currentStep = step;

        // Smooth scroll to form
        targetCollapse?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Add animation class
        setTimeout(() => {
            targetCollapse?.classList.add('success-animation');
            setTimeout(() => {
                targetCollapse?.classList.remove('success-animation');
            }, 600);
        }, 100);
    }

    validateAndGoToStep(nextStep) {
        const currentStepFields = document.querySelectorAll(`#step${this.currentStep}Collapse [data-validation]`);
        let isValid = true;
        let firstInvalidField = null;

        // Clear previous validation errors
        currentStepFields.forEach(field => {
            field.classList.remove('step-validation-error');
        });

        // Validate current step fields
        currentStepFields.forEach(field => {
            const validation = field.dataset.validation;
            const value = field.value.trim();

            if (validation.includes('required') && !value) {
                field.classList.add('step-validation-error');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }

            if (validation.includes('email') && value && !this.isValidEmail(value)) {
                field.classList.add('step-validation-error');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }

            if (validation.includes('phone') && value && !this.isValidPhone(value)) {
                field.classList.add('step-validation-error');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }

            if (validation.includes('username') && value && !this.isValidUsername(value)) {
                field.classList.add('step-validation-error');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }

            if (validation.includes('password') && value && !this.isValidPassword(value)) {
                field.classList.add('step-validation-error');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });

        if (!isValid) {
            this.showGlobalError('Please fill in all required fields correctly before proceeding.');
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Add success animation before proceeding
        const currentCollapse = document.getElementById(`step${this.currentStep}Collapse`);
        currentCollapse?.classList.add('success-animation');

        setTimeout(() => {
            this.goToStep(nextStep);
        }, 200);
    }

    updateProgress(step) {
        for (let i = 1; i <= this.totalSteps; i++) {
            const progressStep = document.getElementById(`progressStep${i}`);
            if (!progressStep) continue;

            progressStep.classList.remove('active', 'completed');

            if (i < step) {
                progressStep.classList.add('completed');
                // Add checkmark icon
                const stepNumber = progressStep.querySelector('.step-number');
                if (stepNumber && !stepNumber.querySelector('i')) {
                    stepNumber.innerHTML = '<i class="fas fa-check"></i>';
                }
            } else if (i === step) {
                progressStep.classList.add('active');
                // Reset to number
                const stepNumber = progressStep.querySelector('.step-number');
                if (stepNumber) {
                    stepNumber.textContent = i;
                }
            } else {
                // Reset to number
                const stepNumber = progressStep.querySelector('.step-number');
                if (stepNumber) {
                    stepNumber.textContent = i;
                }
            }
        }
    }

    // Validation Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[0-9\-\+\s\(\)]*$/;
        return phoneRegex.test(phone);
    }

    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(username) && username.length >= 3 && username.length <= 100;
    }

    isValidPassword(password) {
        // At least 8 chars, one uppercase, one lowercase, one digit, one special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()\-_+#=])[A-Za-z\d@$!%*?&()\-_+#=]{8,}$/;
        return passwordRegex.test(password);
    }

    validateEmail(field) {
        const value = field.value.trim();
        if (value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateUsername(field) {
        const value = field.value.trim();
        if (value && !this.isValidUsername(value)) {
            this.showFieldError(field, 'Username must be 3-100 characters, letters, numbers, and underscores only');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validatePassword(field) {
        const value = field.value;
        if (value && !this.isValidPassword(value)) {
            this.showFieldError(field, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    updatePasswordStrength(password, strengthIndicator) {
        if (!password) {
            strengthIndicator.className = 'password-strength';
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&()\-_+#=]/.test(password)) strength++;

        strengthIndicator.className = 'password-strength';

        setTimeout(() => {
            if (strength <= 1) {
                strengthIndicator.classList.add('weak');
            } else if (strength === 2 || strength === 3) {
                strengthIndicator.classList.add('medium');
            } else {
                strengthIndicator.classList.add('strong');
            }
        }, 100);
    }

    // Error Handling
    showGlobalError(message) {
        const errorAlert = document.getElementById('globalErrorAlert');
        const errorMessage = document.getElementById('globalErrorMessage');

        if (errorAlert && errorMessage) {
            errorMessage.textContent = message;
            errorAlert.style.display = 'block';
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorAlert.style.display = 'none';
            }, 5000);
        }
    }

    showFieldError(field, message) {
        field.classList.add('step-validation-error');

        // Create or update error message
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('step-validation-error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Form Submission
    handleFormSubmit(e) {
        e.preventDefault();

        // Validate all steps
        for (let step = 1; step <= this.totalSteps; step++) {
            const stepFields = document.querySelectorAll(`#step${step}Collapse [data-validation]`);
            let stepValid = true;

            stepFields.forEach(field => {
                const validation = field.dataset.validation;
                const value = field.value.trim();

                if (validation.includes('required') && !value) {
                    field.classList.add('step-validation-error');
                    stepValid = false;
                }

                // Additional validation for specific fields
                if (validation.includes('email') && value && !this.isValidEmail(value)) {
                    field.classList.add('step-validation-error');
                    stepValid = false;
                }

                if (validation.includes('username') && value && !this.isValidUsername(value)) {
                    field.classList.add('step-validation-error');
                    stepValid = false;
                }

                if (validation.includes('password') && value && !this.isValidPassword(value)) {
                    field.classList.add('step-validation-error');
                    stepValid = false;
                }
            });

            if (!stepValid) {
                this.goToStep(step);
                this.showGlobalError('Please complete all required fields before submitting.');
                return;
            }
        }

        // Submit form
        this.submitForm();
    }

    async submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const buttonText = submitBtn.querySelector('.button-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        // Show loading state
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(this.form);

            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'text/html'
                }
            });

            if (response.ok) {
                // Check if response is a redirect
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    // Server returned HTML (likely a redirect page)
                    window.location.href = response.url;
                } else {
                    // Check for redirect
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        throw new Error('Unexpected response from server');
                    }
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showGlobalError('Registration failed. Please try again or contact support.');

            // Reset button state
            buttonText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    handleQuickSubmit() {
        // Ctrl+Enter to submit if on last step
        if (this.currentStep === this.totalSteps) {
            this.form?.requestSubmit();
        } else {
            // Otherwise, go to next step
            this.validateAndGoToStep(this.currentStep + 1);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.registrationForm = new RegistrationForm();
});

// Global functions for button onclick handlers
window.validateAndGoToStep = function(nextStep) {
    window.registrationForm?.validateAndGoToStep(nextStep);
};

window.goToStep = function(step) {
    window.registrationForm?.goToStep(step);
};

// Utility functions for backward compatibility
window.showGlobalError = function(message) {
    window.registrationForm?.showGlobalError(message);
};