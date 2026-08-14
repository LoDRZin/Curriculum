document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check for saved theme preference or use default (dark)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        htmlElement.classList.replace('dark', 'light');
        themeIcon.classList.replace('ph-sun', 'ph-moon');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.replace('dark', 'light');
            themeIcon.classList.replace('ph-sun', 'ph-moon');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.replace('light', 'dark');
            themeIcon.classList.replace('ph-moon', 'ph-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    // 2. Typewriter Effect
    const typewriterElement = document.getElementById('typewriter');
    const textToType = typewriterElement.getAttribute('data-text');
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < textToType.length) {
            typewriterElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            // Randomize typing speed slightly for realism
            setTimeout(typeWriter, Math.random() * 50 + 50); 
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 1000);

    // 3. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. Reveal Animations on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    const progressFills = document.querySelectorAll('.progress-fill');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the skills section, animate the progress bars
                if (entry.target.id === 'skills') {
                    progressFills.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-width');
                        // Add a slight delay before filling
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 300);
                    });
                }
                
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 5. Case Preview Interactivity
    const btnPreviewTrigger = document.querySelector('.btn-preview-trigger');
    const casePreviewWrapper = document.getElementById('case-preview');

    if (btnPreviewTrigger && casePreviewWrapper) {
        btnPreviewTrigger.addEventListener('click', () => {
            casePreviewWrapper.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Reload Preview Simulation for iframe
    const reloadPreviewBtn = document.getElementById('reload-preview-btn');
    const previewIframe = document.getElementById('preview-iframe');
    if (reloadPreviewBtn) {
        reloadPreviewBtn.addEventListener('click', () => {
            reloadPreviewBtn.style.transform = 'rotate(360deg)';
            reloadPreviewBtn.style.transition = 'transform 0.6s ease';
            
            if (previewIframe) {
                // Force iframe reload
                previewIframe.src = previewIframe.src;
            }

            setTimeout(() => {
                reloadPreviewBtn.style.transform = 'rotate(0deg)';
                reloadPreviewBtn.style.transition = 'none';
            }, 600);
        });
    }
});
