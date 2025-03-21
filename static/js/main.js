document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const keywordInput = document.getElementById('keyword');
    const loader = document.getElementById('loader');
    const totalEmails = document.getElementById('total-emails');
    const matchingEmails = document.getElementById('matching-emails');
    const emailList = document.getElementById('email-list');
    const errorContainer = document.getElementById('error-container');
    const errorList = document.getElementById('error-list');
    const resultsContainer = document.getElementById('results-container');
    const searchBtn = document.getElementById('search-btn');
    
    // Apply animations to elements when the page loads
    document.querySelectorAll('.search-container, .stats, .results-container').forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });

    // Hide loader initially
    loader.style.display = 'none';

    // Focus on the search input when page loads
    keywordInput.focus();
    
    // Add typing animation to placeholder
    const placeholders = ['Enter keyword to search...', 'Try "meeting"', 'Try "report"', 'Try "urgent"', 'Try "project"'];
    let currentPlaceholder = 0;
    
    function rotatePlaceholders() {
        const next = placeholders[currentPlaceholder];
        let i = 0;
        keywordInput.placeholder = '';
        
        // Clear previous interval
        if (window.placeholderInterval) clearInterval(window.placeholderInterval);
        
        // Type out the placeholder
        window.placeholderInterval = setInterval(() => {
            if (i < next.length) {
                keywordInput.placeholder += next[i];
                i++;
            } else {
                clearInterval(window.placeholderInterval);
                
                // Move to next placeholder after delay
                setTimeout(() => {
                    currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
                    rotatePlaceholders();
                }, 3000);
            }
        }, 50);
    }
    
    rotatePlaceholders();

    // Add event listener for form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get the keyword value
        const keyword = keywordInput.value.trim();
        
        if (!keyword) {
            showError('Please enter a keyword to search for');
            shakeElement(keywordInput);
            return;
        }
        
        // Show loader and hide any previous errors
        loader.style.display = 'flex';
        errorContainer.style.display = 'none';
        emailList.innerHTML = '';
        
        // Disable button while searching and show loading state
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Searching...';
        
        // Create form data
        const formData = new FormData();
        formData.append('keyword', keyword);
        
        // Send fetch request to the server
        fetch('/search', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Process and display the results
            displayResults(data, keyword);
        })
        .catch(error => {
            showError('Error: ' + error.message);
        })
        .finally(() => {
            // Hide loader and restore button
            loader.style.display = 'none';
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
        });
    });

    // Function to display search results
    function displayResults(data, keyword) {
        // Update stats with counter animation
        animateCounter(totalEmails, data.count || 0);
        animateCounter(matchingEmails, data.results ? data.results.length : 0);
        
        // Clear previous results
        emailList.innerHTML = '';
        
        // Check if there are any errors to display
        if (data.errors && data.errors.length > 0) {
            displayErrors(data.errors);
        }
        
        // If no results, show a message
        if (!data.results || data.results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'empty-state';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No emails found containing the keyword "${keyword}". Try another search term.</p>
            `;
            emailList.appendChild(noResults);
            return;
        }
        
        // Create a card for each email result with staggered animation
        data.results.forEach((email, index) => {
            const emailCard = document.createElement('div');
            emailCard.className = 'email-card';
            emailCard.style.opacity = '0';
            emailCard.style.transform = 'translateY(20px)';
            
            // Highlight the keyword in the subject and body
            const highlightedSubject = highlightKeyword(email.subject, keyword);
            const highlightedBody = highlightKeyword(email.body, keyword);
            
            emailCard.innerHTML = `
                <div class="email-header">
                    <div class="email-sender"><i class="fas fa-user"></i> ${email.sender}</div>
                    <div class="email-date"><i class="far fa-clock"></i> ${email.date}</div>
                </div>
                <div class="email-subject">${highlightedSubject}</div>
                <div class="email-body">${highlightedBody}</div>
            `;
            
            emailList.appendChild(emailCard);
            
            // Add staggered animation delay
            setTimeout(() => {
                emailCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                emailCard.style.opacity = '1';
                emailCard.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Add animation to highlight
        setTimeout(() => {
            const highlights = document.querySelectorAll('.keyword-highlight');
            highlights.forEach((highlight, i) => {
                setTimeout(() => {
                    highlight.classList.add('pop-animation');
                }, i * 100);
            });
        }, 500);

        // Scroll to results section with smooth animation
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
    
    // Function to animate counter
    function animateCounter(element, targetValue) {
        const duration = 1000; // ms
        const startValue = parseInt(element.textContent) || 0;
        const difference = targetValue - startValue;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                const currentValue = Math.floor(startValue + difference * easeProgress);
                element.textContent = currentValue;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = targetValue;
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Function to highlight keywords in text
    function highlightKeyword(text, keyword) {
        if (!text) return '';
        
        // Create a regex that ignores case and handles special characters
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');
        return text.replace(regex, '<span class="keyword-highlight">$1</span>');
    }
    
    // Function to display errors
    function displayErrors(errors) {
        errorList.innerHTML = '';
        
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        errorContainer.style.display = 'block';
        
        // Add animation
        errorContainer.style.animation = 'none';
        void errorContainer.offsetWidth; // Trigger reflow
        errorContainer.style.animation = 'slideIn 0.3s ease-out';
    }
    
    // Function to show a single error
    function showError(message) {
        errorList.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = message;
        errorList.appendChild(li);
        errorContainer.style.display = 'block';
        
        // Add animation
        errorContainer.style.animation = 'none';
        void errorContainer.offsetWidth; // Trigger reflow
        errorContainer.style.animation = 'slideIn 0.3s ease-out';
    }
    
    // Function to shake an element (error indication)
    function shakeElement(element) {
        element.style.animation = 'none';
        void element.offsetWidth; // Trigger reflow
        element.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
    }
    
    // Add keyframe animation for shake
    if (!document.querySelector('#shake-animation')) {
        const style = document.createElement('style');
        style.id = 'shake-animation';
        style.textContent = `
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            @keyframes pop-animation {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // Add animation to search button
    searchBtn.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    searchBtn.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    searchBtn.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
    
    // Add hover effect to email cards
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.email-card')) {
            const cards = document.querySelectorAll('.email-card');
            const hoveredCard = e.target.closest('.email-card');
            
            cards.forEach(card => {
                if (card !== hoveredCard) {
                    card.style.opacity = '0.7';
                }
            });
        }
    }, true);
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.email-card')) {
            const cards = document.querySelectorAll('.email-card');
            
            cards.forEach(card => {
                card.style.opacity = '1';
            });
        }
    }, true);
}); 