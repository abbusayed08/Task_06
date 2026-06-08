/* ============================================
   CONTACT FORM - JAVASCRIPT VALIDATION
   Client-Side Validation & Error Handling
   ============================================ */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    /**
     * Minimum length for name field
     */
    MIN_NAME_LENGTH: 3,

    /**
     * Minimum length for message field
     */
    MIN_MESSAGE_LENGTH: 10,

    /**
     * Delay before clearing error messages (in milliseconds)
     */
    ERROR_CLEAR_DELAY: 200,

    /**
     * Duration of loading animation (in milliseconds)
     */
    LOADING_DURATION: 2000,

    /**
     * Duration before resetting form (in milliseconds)
     */
    RESET_DELAY: 2500,

    /**
     * Robust email regex pattern for standard email validation
     * Matches most common email formats while avoiding overly complex patterns
     */
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /**
     * Error messages mapping
     */
    ERROR_MESSAGES: {
        fullName: {
            empty: 'Name cannot be empty',
            tooShort: `Name must be at least ${3} characters long`,
        },
        email: {
            empty: 'Email cannot be empty',
            invalid: 'Please enter a valid email address',
        },
        message: {
            empty: 'Message cannot be empty',
            tooShort: `Message must be at least ${10} characters long`,
        },
    },

    /**
     * Success message configuration
     */
    SUCCESS_MESSAGE: 'Your message has been submitted successfully!',
};

// ============================================
// RESPONSES STORAGE CONFIGURATION
// ============================================

const STORAGE = {
    /**
     * Key for storing responses in localStorage
     */
    KEY: 'contactFormResponses',

    /**
     * Get all responses from localStorage
     * @returns {array} - Array of response objects
     */
    getResponses() {
        try {
            const responses = localStorage.getItem(this.KEY);
            return responses ? JSON.parse(responses) : [];
        } catch (error) {
            console.error('Error retrieving responses:', error);
            return [];
        }
    },

    /**
     * Save a new response to localStorage
     * @param {object} response - Response object with name, email, message
     */
    saveResponse(response) {
        try {
            const responses = this.getResponses();
            const newResponse = {
                id: Date.now(),
                name: response.name,
                email: response.email,
                message: response.message,
                timestamp: new Date().toLocaleString(),
                submittedAt: new Date().getTime(),
            };
            responses.unshift(newResponse); // Add to beginning
            localStorage.setItem(this.KEY, JSON.stringify(responses));
            return newResponse;
        } catch (error) {
            console.error('Error saving response:', error);
        }
    },

    /**
     * Delete a specific response by ID
     * @param {number} id - Response ID (timestamp)
     */
    deleteResponse(id) {
        try {
            let responses = this.getResponses();
            responses = responses.filter(r => r.id !== id);
            localStorage.setItem(this.KEY, JSON.stringify(responses));
        } catch (error) {
            console.error('Error deleting response:', error);
        }
    },

    /**
     * Clear all responses from localStorage
     */
    clearAll() {
        try {
            localStorage.removeItem(this.KEY);
        } catch (error) {
            console.error('Error clearing responses:', error);
        }
    },
};

// ============================================
// DOM ELEMENTS CACHE
// ============================================

const DOM = {
    /**
     * Cache of all DOM elements used in the form
     */
    form: null,
    submitBtn: null,
    btnText: null,
    successMessage: null,

    // Form inputs
    fullName: null,
    email: null,
    message: null,

    // Error message containers
    fullNameError: null,
    emailError: null,
    messageError: null,

    // Modal and responses elements
    modal: null,
    responsesList: null,
    viewResponsesBtn: null,
    closeResponsesBtn: null,
    clearResponsesBtn: null,
    responsesBadge: null,

    /**
     * Initialize DOM references
     */
    init() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = document.querySelector('.btn-text');
        this.successMessage = document.getElementById('successMessage');

        this.fullName = document.getElementById('fullName');
        this.email = document.getElementById('email');
        this.message = document.getElementById('message');

        this.fullNameError = document.getElementById('fullNameError');
        this.emailError = document.getElementById('emailError');
        this.messageError = document.getElementById('messageError');

        // Modal elements
        this.modal = document.getElementById('responsesModal');
        this.responsesList = document.getElementById('responsesList');
        this.viewResponsesBtn = document.getElementById('viewResponsesBtn');
        this.closeResponsesBtn = document.getElementById('closeResponsesBtn');
        this.clearResponsesBtn = document.getElementById('clearResponsesBtn');
        this.responsesBadge = document.getElementById('responsesBadge');
    },
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates the full name field
 * @param {string} value - The name value to validate
 * @returns {object} - {isValid: boolean, error: string}
 */
function validateName(value) {
    // Trim leading and trailing spaces
    const trimmedValue = value.trim();

    // Check if field is empty
    if (!trimmedValue) {
        return {
            isValid: false,
            error: CONFIG.ERROR_MESSAGES.fullName.empty,
        };
    }

    // Check minimum length
    if (trimmedValue.length < CONFIG.MIN_NAME_LENGTH) {
        return {
            isValid: false,
            error: CONFIG.ERROR_MESSAGES.fullName.tooShort,
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

/**
 * Validates the email field using regex pattern
 * @param {string} value - The email value to validate
 * @returns {object} - {isValid: boolean, error: string}
 */
function validateEmail(value) {
    // Trim leading and trailing spaces
    const trimmedValue = value.trim();

    // Check if field is empty
    if (!trimmedValue) {
        return {
            isValid: false,
            error: CONFIG.ERROR_MESSAGES.email.empty,
        };
    }

    // Validate email format using regex
    if (!CONFIG.EMAIL_REGEX.test(trimmedValue)) {
        return {
            isValid: false,
            error: CONFIG.ERROR_MESSAGES.email.invalid,
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

/**
 * Validates the message field
 * @param {string} value - The message value to validate
 * @returns {object} - {isValid: boolean, error: string}
 */
function validateMessage(value) {
    // Trim leading and trailing spaces
    const trimmedValue = value.trim();

    // Check if field is empty or contains only spaces
    if (!trimmedValue) {
        return {
            isValid: false,
            error: CONFIG.ERROR_MESSAGES.message.empty,
        };
    }

    // Check minimum length
    if (trimmedValue.length < CONFIG.MIN_MESSAGE_LENGTH) {
        return {
            isValid: false,
            error: CONFIG.ERROR_MESSAGES.message.tooShort,
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

// ============================================
// ERROR DISPLAY & REMOVAL FUNCTIONS
// ============================================

/**
 * Displays error message for a specific field
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} errorContainer - The error message container
 * @param {string} errorMessage - The error message to display
 */
function displayError(input, errorContainer, errorMessage) {
    // Add error styling to input
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');

    // Display error message with animation
    errorContainer.textContent = errorMessage;
    errorContainer.setAttribute('aria-live', 'polite');
}

/**
 * Removes error message for a specific field
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} errorContainer - The error message container
 */
function removeError(input, errorContainer) {
    // Clear error message
    errorContainer.textContent = '';

    // Remove error styling
    input.classList.remove('is-invalid');
}

/**
 * Displays success styling for an input field
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} errorContainer - The error message container
 */
function displaySuccess(input, errorContainer) {
    // Add success styling
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');

    // Clear any error message
    errorContainer.textContent = '';
}

/**
 * Clears all error messages from the form
 */
function clearAllErrors() {
    removeError(DOM.fullName, DOM.fullNameError);
    removeError(DOM.email, DOM.emailError);
    removeError(DOM.message, DOM.messageError);
}

// ============================================
// INDIVIDUAL FIELD VALIDATION HANDLERS
// ============================================

/**
 * Validates and handles full name field
 * Performs real-time validation and updates UI accordingly
 */
function handleNameValidation() {
    const value = DOM.fullName.value;
    const validation = validateName(value);

    if (!validation.isValid && value.trim()) {
        // Show error only if user has typed something
        displayError(DOM.fullName, DOM.fullNameError, validation.error);
    } else if (validation.isValid) {
        // Show success styling
        displaySuccess(DOM.fullName, DOM.fullNameError);
    } else {
        // Clear styling if field is empty (not submitted yet)
        removeError(DOM.fullName, DOM.fullNameError);
    }
}

/**
 * Validates and handles email field
 * Performs real-time validation and updates UI accordingly
 */
function handleEmailValidation() {
    const value = DOM.email.value;
    const validation = validateEmail(value);

    if (!validation.isValid && value.trim()) {
        // Show error only if user has typed something
        displayError(DOM.email, DOM.emailError, validation.error);
    } else if (validation.isValid) {
        // Show success styling
        displaySuccess(DOM.email, DOM.emailError);
    } else {
        // Clear styling if field is empty (not submitted yet)
        removeError(DOM.email, DOM.emailError);
    }
}

/**
 * Validates and handles message field
 * Performs real-time validation and updates UI accordingly
 */
function handleMessageValidation() {
    const value = DOM.message.value;
    const validation = validateMessage(value);

    if (!validation.isValid && value.trim()) {
        // Show error only if user has typed something
        displayError(DOM.message, DOM.messageError, validation.error);
    } else if (validation.isValid) {
        // Show success styling
        displaySuccess(DOM.message, DOM.messageError);
    } else {
        // Clear styling if field is empty (not submitted yet)
        removeError(DOM.message, DOM.messageError);
    }
}

// ============================================
// COMPLETE FORM VALIDATION
// ============================================

/**
 * Validates all form fields
 * @returns {boolean} - True if all fields are valid, false otherwise
 */
function validateForm() {
    // Validate each field
    const nameValidation = validateName(DOM.fullName.value);
    const emailValidation = validateEmail(DOM.email.value);
    const messageValidation = validateMessage(DOM.message.value);

    // Track validation state
    let isFormValid = true;

    // Handle name field
    if (!nameValidation.isValid) {
        displayError(DOM.fullName, DOM.fullNameError, nameValidation.error);
        isFormValid = false;
    } else {
        displaySuccess(DOM.fullName, DOM.fullNameError);
    }

    // Handle email field
    if (!emailValidation.isValid) {
        displayError(DOM.email, DOM.emailError, emailValidation.error);
        isFormValid = false;
    } else {
        displaySuccess(DOM.email, DOM.emailError);
    }

    // Handle message field
    if (!messageValidation.isValid) {
        displayError(DOM.message, DOM.messageError, messageValidation.error);
        isFormValid = false;
    } else {
        displaySuccess(DOM.message, DOM.messageError);
    }

    return isFormValid;
}

// ============================================
// FORM RESET & CLEANUP
// ============================================

/**
 * Resets the form to its initial state
 * Clears all fields, errors, and styling
 */
function resetForm() {
    // Reset form fields
    DOM.form.reset();

    // Clear all error messages and styling
    clearAllErrors();

    // Remove success styling from all inputs
    DOM.fullName.classList.remove('is-valid');
    DOM.email.classList.remove('is-valid');
    DOM.message.classList.remove('is-valid');
}

// ============================================
// SUCCESS MESSAGE HANDLING
// ============================================

/**
 * Displays the success message with animation
 */
function showSuccessMessage() {
    // Hide form
    DOM.form.classList.add('hidden');

    // Display success message with animation
    DOM.successMessage.classList.add('show');

    // Play success sound (optional - commented out)
    // playSuccessSound();
}

/**
 * Hides the success message and resets the form
 */
function hideSuccessMessage() {
    // Hide success message
    DOM.successMessage.classList.remove('show');

    // Show form again
    DOM.form.classList.remove('hidden');

    // Reset form for new submission
    resetForm();
}

// ============================================
// RESPONSES & MODAL MANAGEMENT
// ============================================

/**
 * Updates the badge count showing number of responses
 */
function updateResponsesBadge() {
    const responses = STORAGE.getResponses();
    const count = responses.length;
    DOM.responsesBadge.textContent = count;
    DOM.responsesBadge.style.display = count > 0 ? 'flex' : 'none';
}

/**
 * Renders a single response card
 * @param {object} response - Response object with id, name, email, message, timestamp
 * @returns {HTMLElement} - Response card element
 */
function createResponseCard(response, index) {
    const card = document.createElement('div');
    card.className = 'response-card';
    card.innerHTML = `
        <div class="response-header">
            <div class="response-info">
                <div class="response-number">Response #${index}</div>
                <div class="response-timestamp">${response.timestamp}</div>
            </div>
            <button class="response-delete-btn" data-id="${response.id}" aria-label="Delete this response">
                Delete
            </button>
        </div>
        <div class="response-field">
            <div class="response-label">Name</div>
            <div class="response-value">${escapeHtml(response.name)}</div>
        </div>
        <div class="response-field">
            <div class="response-label">Email</div>
            <div class="response-value">${escapeHtml(response.email)}</div>
        </div>
        <div class="response-field">
            <div class="response-label">Message</div>
            <div class="response-value">${escapeHtml(response.message)}</div>
        </div>
    `;

    // Add delete button event listener
    const deleteBtn = card.querySelector('.response-delete-btn');
    deleteBtn.addEventListener('click', () => handleDeleteResponse(response.id, card));

    return card;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Displays all responses in the modal
 */
function displayResponses() {
    const responses = STORAGE.getResponses();
    DOM.responsesList.innerHTML = '';

    if (responses.length === 0) {
        DOM.responsesList.innerHTML = '<p class="empty-message">No responses yet. Submit a message to see it here!</p>';
        return;
    }

    responses.forEach((response, index) => {
        const card = createResponseCard(response, responses.length - index);
        DOM.responsesList.appendChild(card);
    });
}

/**
 * Handles deletion of a single response
 * @param {number} id - Response ID
 * @param {HTMLElement} card - Response card element
 */
function handleDeleteResponse(id, card) {
    // Ask for confirmation
    if (!confirm('Are you sure you want to delete this response?')) {
        return;
    }

    // Delete from storage
    STORAGE.deleteResponse(id);

    // Animate card removal
    card.style.animation = 'slideDown 300ms ease-out reverse';
    setTimeout(() => {
        card.remove();
        updateResponsesBadge();

        // Refresh display if no more cards
        if (DOM.responsesList.children.length === 0) {
            displayResponses();
        }
    }, 300);
}

/**
 * Handles clearing all responses
 */
function handleClearResponses() {
    if (!confirm('Are you sure you want to clear all responses? This action cannot be undone.')) {
        return;
    }

    // Clear from storage
    STORAGE.clearAll();

    // Update UI
    updateResponsesBadge();
    displayResponses();

    console.log('All responses cleared');
}

/**
 * Opens the responses modal
 */
function openResponsesModal() {
    displayResponses();
    DOM.modal.classList.add('show');
}

/**
 * Closes the responses modal
 */
function closeResponsesModal() {
    DOM.modal.classList.remove('show');
}

/**
 * Close modal when clicking outside of it
 * @param {Event} event - Click event
 */
function handleModalBackdropClick(event) {
    if (event.target === DOM.modal) {
        closeResponsesModal();
    }
}

// ============================================
// SUBMIT BUTTON STATE MANAGEMENT
// ============================================

/**
 * Sets the submit button to loading state
 */
function setButtonLoading() {
    DOM.submitBtn.disabled = true;
    DOM.submitBtn.classList.add('loading');
    DOM.btnText.textContent = 'Sending...';
}

/**
 * Resets the submit button to normal state
 */
function resetButton() {
    DOM.submitBtn.disabled = false;
    DOM.submitBtn.classList.remove('loading');
    DOM.btnText.textContent = 'Send Message';
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

/**
 * Handles form submission
 * Validates form, prevents submission if invalid,
 * shows success message if valid, and saves response
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    // Prevent default form submission
    event.preventDefault();

    // Validate all fields
    if (!validateForm()) {
        // Prevent submission if validation fails
        console.log('Form validation failed');
        return;
    }

    // Set button to loading state
    setButtonLoading();

    /**
     * Simulate API call or processing delay
     * In a real application, this would be an actual HTTP request
     */
    setTimeout(() => {
        // Save response to localStorage
        const formData = {
            name: DOM.fullName.value.trim(),
            email: DOM.email.value.trim(),
            message: DOM.message.value.trim(),
        };
        STORAGE.saveResponse(formData);

        // Update badge count
        updateResponsesBadge();

        // Show success message
        showSuccessMessage();

        // Reset submit button
        resetButton();

        /**
         * Auto-hide success message and reset form
         * Allows user to submit another message
         */
        setTimeout(() => {
            hideSuccessMessage();
        }, CONFIG.RESET_DELAY);
    }, CONFIG.LOADING_DURATION);
}

/**
 * Initializes all event listeners for real-time validation
 * and form submission
 */
function setupEventListeners() {
    // Real-time validation on input
    DOM.fullName.addEventListener('input', handleNameValidation);
    DOM.email.addEventListener('input', handleEmailValidation);
    DOM.message.addEventListener('input', handleMessageValidation);

    // Real-time validation on blur (when user leaves field)
    DOM.fullName.addEventListener('blur', handleNameValidation);
    DOM.email.addEventListener('blur', handleEmailValidation);
    DOM.message.addEventListener('blur', handleMessageValidation);

    // Form submission
    DOM.form.addEventListener('submit', handleFormSubmit);

    // Prevent form submission on Enter key from textarea
    DOM.message.addEventListener('keydown', (event) => {
        // Allow Ctrl+Enter or Cmd+Enter to submit
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            DOM.form.dispatchEvent(new Event('submit'));
        }
    });

    // Modal event listeners
    DOM.viewResponsesBtn.addEventListener('click', openResponsesModal);
    DOM.closeResponsesBtn.addEventListener('click', closeResponsesModal);
    DOM.clearResponsesBtn.addEventListener('click', handleClearResponses);
    DOM.modal.addEventListener('click', handleModalBackdropClick);

    // Close modal on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && DOM.modal.classList.contains('show')) {
            closeResponsesModal();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initializes the contact form
 * Called when DOM is fully loaded
 */
function initializeForm() {
    // Initialize DOM references
    DOM.init();

    // Check if all required elements exist
    if (!DOM.form || !DOM.fullName || !DOM.email || !DOM.message) {
        console.error('Required form elements not found in DOM');
        return;
    }

    // Setup event listeners
    setupEventListeners();

    // Initialize responses badge
    updateResponsesBadge();

    // Log successful initialization
    console.log('Contact form initialized successfully');
}

// ============================================
// DOM READY CHECK & INITIALIZATION
// ============================================

/**
 * Execute initialization when DOM is fully loaded
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
} else {
    // DOM is already loaded
    initializeForm();
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

/**
 * Trap focus within the form when it has focus
 * Improves keyboard navigation for accessibility
 */
document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        const focusableElements = DOM.form.querySelectorAll(
            'input, textarea, button'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        // Shift + Tab from first element
        if (event.shiftKey && activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
        // Tab from last element
        else if (!event.shiftKey && activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
});

// ============================================
// END OF CONTACT FORM SCRIPT
// ============================================
