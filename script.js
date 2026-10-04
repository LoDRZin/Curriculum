// ============================================================
// DOMContentLoaded — UI interactions
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // 1. Theme Toggle (claro / escuro) — o tema inicial é aplicado no <head>
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function applyTheme(theme) {
        htmlEl.classList.remove('light', 'dark');
        htmlEl.classList.add(theme);
        // Ícone mostra o tema para o qual o clique vai alternar
        themeIcon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
        if (themeMeta) themeMeta.content = theme === 'dark' ? '#101713' : '#F7F6F2';
    }

    applyTheme(htmlEl.classList.contains('dark') ? 'dark' : 'light');

    themeToggleBtn.addEventListener('click', () => {
        const next = htmlEl.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('curriculum_theme', next);
    });

    // 2. Typewriter Effect
    const typewriterEl = document.getElementById('typewriter');
    const text = typewriterEl.dataset.text;
    let idx = 0;

    const type = () => {
        if (idx < text.length) {
            typewriterEl.textContent += text[idx++];
            setTimeout(type, Math.random() * 50 + 50);
        }
    };
    setTimeout(type, 1000);

    // 3. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // 4. Reveal on Scroll
    const progressFills = document.querySelectorAll('.progress-fill');
    let skillsAnimated = false;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            if (entry.target.id === 'skills' && !skillsAnimated) {
                skillsAnimated = true;
                setTimeout(() => {
                    progressFills.forEach(bar => { bar.style.width = bar.dataset.width; });
                }, 300);
            }
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 5. Abas "Sobre mim" (acessível por teclado: setas, Home, End)
    const aboutTabs = Array.from(document.querySelectorAll('.tab-btn'));

    function activateAboutTab(btn, focus) {
        aboutTabs.forEach(t => {
            const active = t === btn;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', String(active));
            t.tabIndex = active ? 0 : -1;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            panel.hidden = !active;
            panel.classList.toggle('active', active);
        });
        if (focus) btn.focus();
    }

    aboutTabs.forEach((btn, i) => {
        btn.addEventListener('click', () => activateAboutTab(btn, false));
        btn.addEventListener('keydown', e => {
            let target = null;
            if (e.key === 'ArrowRight') target = aboutTabs[(i + 1) % aboutTabs.length];
            else if (e.key === 'ArrowLeft') target = aboutTabs[(i - 1 + aboutTabs.length) % aboutTabs.length];
            else if (e.key === 'Home') target = aboutTabs[0];
            else if (e.key === 'End') target = aboutTabs[aboutTabs.length - 1];
            if (target) {
                e.preventDefault();
                activateAboutTab(target, true);
            }
        });
    });

    // 6. Seletor de projetos (BrasImports / ConectaVagasDF)
    const projectTabs = document.querySelectorAll('.project-tab');
    const projectPanels = document.querySelectorAll('.project-panel');

    function loadLazyIframe(panel) {
        const frame = panel.querySelector('iframe[data-src]');
        if (frame && !frame.src) frame.src = frame.dataset.src;
    }

    projectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            projectTabs.forEach(t => {
                const active = t === tab;
                t.classList.toggle('active', active);
                t.setAttribute('aria-selected', String(active));
            });
            projectPanels.forEach(panel => {
                const active = panel.id === `project-${tab.dataset.project}`;
                panel.hidden = !active;
                panel.classList.toggle('active', active);
                if (active) loadLazyIframe(panel);
            });
        });
    });

    // 7. Reload Preview iframes
    document.querySelectorAll('.reload-preview-btn').forEach(btn => {
        const frame = document.getElementById(btn.dataset.target);
        if (!frame) return;
        btn.addEventListener('click', () => {
            btn.style.cssText = 'transform: rotate(360deg); transition: transform 0.6s ease;';
            const url = frame.src || frame.dataset.src;
            frame.src = url;
            setTimeout(() => { btn.style.cssText = ''; }, 650);
        });
    });
});
