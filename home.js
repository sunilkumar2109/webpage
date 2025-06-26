document.addEventListener('DOMContentLoaded', function() {
    // Questions data
    const questions = [
        {
            id: 1,
            question: "What is your estimated budget for studying abroad? (in INR)",
            type: 'input',
            placeholder: "Enter your budget (e.g., 500000)",
            validation: (value) => {
                const budget = parseInt(value);
                return !isNaN(budget) && budget >= 200000;
            },
            errorMessage: "Please enter a valid budget amount (minimum ₹200,000)"
        },
        {
            id: 2,
            question: "What is your current education level?",
            type: 'select',
            options: [
                "Select your education level",
                "Undergraduate",
                "Graduate/Master's",
                "PhD/Doctorate",
                "Diploma/Certificate"
            ]
        },
        {
            id: 3,
            question: "Do you have any preferred universities or colleges?",
            type: 'input',
            placeholder: "Enter preferred universities (e.g., Harvard, Stanford)"
        }
    ];

    // DOM Elements
    const searchInput = document.getElementById('countrySearch');
    const searchBtn = document.getElementById('searchBtn');
    const glassModal = document.getElementById('glassModal');
    const closeModal = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const typingText = document.getElementById('typingText');
    const answerBox = document.getElementById('answerBox');
    const callbackForm = document.getElementById('callbackForm');
    
    let currentQuestionIndex = 0;
    let currentTypingInterval = null;
    let answers = {};
    
    // Relevant countries for triggering modal
    const relevantCountries = [
        'germany', 'canada', 'usa', 'australia', 'uk', 'japan', 'france', 
        'india', 'china', 'singapore', 'netherlands', 'sweden', 'norway', 
        'denmark', 'finland', 'switzerland', 'austria', 'belgium', 'ireland', 
        'new zealand', 'south korea', 'italy', 'spain', 'portugal'
    ];
    
    // Typing animation function
    function typeQuestion(element, text, speed = 80) {
        if (currentTypingInterval) {
            clearInterval(currentTypingInterval);
            currentTypingInterval = null;
        }
        
        element.innerHTML = '';
        let i = 0;
        
        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);
        
        currentTypingInterval = setInterval(() => {
            if (i < text.length) {
                element.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor"></span>';
                i++;
            } else {
                clearInterval(currentTypingInterval);
                currentTypingInterval = null;
                element.innerHTML = text + '<span class="typing-cursor"></span>';
                // Show answer box after typing completes
                setTimeout(() => {
                    showAnswerBox();
                }, 300);
            }
        }, speed);
    }
    
    // Show answer box with animation
    function showAnswerBox() {
        answerBox.classList.add('active');
    }
    
    // Create answer input based on question type
    function createAnswerInput(question) {
        let html = '';
        
        if (question.type === 'input') {
            const inputType = question.id === 1 ? 'number' : 'text';
            html = `
                <input 
                    type="${inputType}" 
                    id="answer${question.id}" 
                    placeholder="${question.placeholder}" 
                    class="glass-input"
                    value="${answers[question.id] || ''}"
                />
            `;
            if (question.errorMessage) {
                html += `<div id="error${question.id}" class="error-message">${question.errorMessage}</div>`;
            }
        } else if (question.type === 'select') {
            html = `
                <select id="answer${question.id}" class="glass-select">
                    ${question.options.map((option, index) => 
                        `<option value="${index === 0 ? '' : option}" ${answers[question.id] === option ? 'selected' : ''}>${option}</option>`
                    ).join('')}
                </select>
                <div id="error${question.id}" class="error-message">Please select an option</div>
            `;
        }
        
        return html;
    }
    
    // Show specific question
    function showQuestion(index) {
        const question = questions[index];
        
        // Reset answer box
        answerBox.classList.remove('active');
        answerBox.innerHTML = '';
        
        // Start typing animation
        typeQuestion(typingText, question.question);
        
        // Create answer input
        answerBox.innerHTML = createAnswerInput(question);
        
        // Update progress dots
        document.querySelectorAll('.progress-dot').forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i < index) {
                dot.classList.add('completed');
            } else if (i === index) {
                dot.classList.add('active');
            }
        });
        
        // Update buttons
        prevBtn.disabled = index === 0;
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i> Get Recommendations';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right ml-2"></i>';
        }
        
        // Add event listener to answer input
        setTimeout(() => {
            const answerInput = document.getElementById(`answer${question.id}`);
            if (answerInput) {
                answerInput.addEventListener('input', () => {
                    answers[question.id] = answerInput.value;
                    hideError(question.id);
                });
            }
        }, 500);
    }
    
    // Validation functions
    function validateAnswer(questionIndex) {
        const question = questions[questionIndex];
        const answer = answers[question.id] || '';
        
        if (question.validation) {
            if (!question.validation(answer)) {
                showError(question.id);
                return false;
            }
        } else if (question.type === 'select' && (!answer || answer === question.options[0])) {
            showError(question.id);
            return false;
        }
        
        hideError(question.id);
        return true;
    }
    
    function showError(questionId) {
        const errorElement = document.getElementById(`error${questionId}`);
        if (errorElement) {
            errorElement.classList.add('show');
        }
    }
    
    function hideError(questionId) {
        const errorElement = document.getElementById(`error${questionId}`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }
    
    // Open modal function
    function openModal() {
        glassModal.classList.add('active');
        currentQuestionIndex = 0;
        answers = {};
        showQuestion(currentQuestionIndex);
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal function
    function closeModalFunction() {
        glassModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear typing animation
        if (currentTypingInterval) {
            clearInterval(currentTypingInterval);
            currentTypingInterval = null;
        }
        
        // Reset form
        currentQuestionIndex = 0;
        answers = {};
        answerBox.classList.remove('active');
        typingText.innerHTML = '';
        answerBox.innerHTML = '';
    }
    
    // Event Listeners
    
    // Search input - trigger modal on country names
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm.length >= 3 && relevantCountries.some(country => searchTerm.includes(country))) {
            openModal();
        }
    });
    
    // Search button
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.length >= 3) {
            openModal();
        } else {
            alert('Please enter at least 3 characters to search for a country.');
        }
    });
    
    // Navigation buttons
    nextBtn.addEventListener('click', function() {
        // Validate current answer
        if (!validateAnswer(currentQuestionIndex)) {
            return;
        }
        
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            // Final submission
            console.log('Form submitted:', { searchTerm: searchInput.value, answers });
            alert('Thank you for your answers! We will help you find the perfect study destination based on your preferences.');
            closeModalFunction();
            searchInput.value = '';
        }
    });
    
    prevBtn.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });
    
    // Close modal events
    closeModal.addEventListener('click', closeModalFunction);
    
    glassModal.addEventListener('click', function(e) {
        if (e.target === glassModal) {
            closeModalFunction();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && glassModal.classList.contains('active')) {
            closeModalFunction();
        }
    });
    
    // Callback form submission
    callbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your request! We will call you back shortly.');
        callbackForm.reset();
    });
});