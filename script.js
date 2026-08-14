// ============================================================
// Starfield Warp — GlitterWrap ported to vanilla JS
// Colors: verde neon (#00FF5E, #00FF0D, #00FF36)
// ============================================================
(function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Config
    const CFG = {
        particleCount : 500,
        color1        : '#00FF5E',
        color2        : '#00FF0D',
        color3        : '#00FF36',
        speed         : 5,
        density       : 100,
        starSize      : 20,
        focalDepth    : 13,
        turbulence    : 0,
        brightness    : 100,
        glitter       : 3,
        trail         : 80,
        reverse       : false,
    };

    // Cached computed values
    const c = {
        stepZ      : CFG.speed      * 0.0008,
        focal      : CFG.focalDepth / 100,
        starScale  : CFG.starSize   * 0.15,
        turb       : CFG.turbulence * 0.2,
        glitter    : CFG.glitter    * 0.1,
        brightness : Math.min(1, CFG.brightness / 100),
        trail      : CFG.trail      / 100,
    };

    // Parse hex colors to rgb strings (done once at startup)
    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        const n = parseInt(h, 16);
        return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    }
    const rgbStrs = [hexToRgb(CFG.color1), hexToRgb(CFG.color2), hexToRgb(CFG.color3)];

    // Sizing
    let W = 0, H = 0, dpr = 1;

    function resize() {
        const newDpr = Math.min(window.devicePixelRatio || 1, 2);
        const newW   = Math.max(1, window.innerWidth);
        const newH   = Math.max(1, window.innerHeight);
        if (newW === W && newH === H && newDpr === dpr) return;
        W = newW; H = newH; dpr = newDpr;
        canvas.width  = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
    }

    // Star pool
    let elapsed  = 0;
    let lastT    = performance.now();
    const stars  = [];

    function resetStar(s, initial) {
        const angle  = Math.random() * Math.PI * 2;
        const radius = (0.2 + Math.random() * 0.8) * (CFG.density / 15);
        s.x = Math.cos(angle) * radius;
        s.y = Math.sin(angle) * radius;
        s.z = initial ? Math.random() : 1.0;
        s.px = NaN;
        s.py = NaN;
        s.seed     = Math.random() * 1000;
        s.vmul     = 0.6 + Math.random() * 0.8;
        s.colorIdx = Math.floor(Math.random() * 3);
        s.flashUntil = 0;
        s.nextFlash  = elapsed + 1 + Math.random() * 4 * (1 / Math.max(0.0001, c.glitter));
    }

    for (let i = 0; i < CFG.particleCount; i++) {
        const s = { x:0,y:0,z:0,px:NaN,py:NaN,seed:0,vmul:1,colorIdx:0,flashUntil:0,nextFlash:0 };
        resetStar(s, true);
        stars.push(s);
    }

    function drawFrame(deltaSec) {
        const dt  = Math.max(0.001, Math.min(0.1, deltaSec)) * 60;
        const cx  = W / 2, cy = H / 2;
        const ps  = Math.min(W, H) * 0.9;

        // Trail fade using destination-out
        const keep = Math.pow(Math.min(0.98, Math.max(0, c.trail)), dt);
        const trailAlpha = Math.max(0.02, 1 - keep);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0,0,0,${trailAlpha})`;
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < stars.length; i++) {
            const s  = stars[i];
            const vz = c.stepZ * s.vmul * dt;
            s.z -= vz;
            if (s.z <= c.focal) { resetStar(s, false); continue; }

            let tx = s.x, ty = s.y;
            if (c.turb > 0) {
                const t   = elapsed * 1.2 + s.seed;
                const amp = c.turb * (1 - s.z) * 0.25;
                tx += Math.sin(t + s.seed)          * amp;
                ty += Math.cos(t * 1.13 + s.seed * 0.7) * amp;
            }

            const persp = c.focal / Math.max(s.z, 0.0001);
            const sx = cx + tx * persp * ps;
            const sy = cy + ty * persp * ps;

            if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) {
                resetStar(s, false);
                continue;
            }

            // Glitter
            let flashMult = 1;
            if (c.glitter > 0) {
                if (elapsed >= s.nextFlash && s.flashUntil < elapsed) {
                    s.flashUntil = elapsed + 0.04 + Math.random() * 0.07;
                    s.nextFlash  = elapsed + 1 + Math.random() * 4 * (1 / Math.max(0.0001, c.glitter));
                }
                if (elapsed <= s.flashUntil) flashMult = 1 + 2.5 * c.glitter;
            }

            // Size
            const sizePersp = Math.min(2.5, persp * 0.6);
            const baseR     = Math.max(0.25, c.starScale * (0.4 + sizePersp));
            const maxR      = 1 + c.starScale * 2.5;
            const r         = Math.min(baseR * flashMult, maxR);

            // Alpha
            const lifeT = 1 - s.z;
            const a     = Math.min(1, lifeT * 0.9 + 0.05) * c.brightness * (flashMult > 1 ? 1 : 0.85);

            const colStr = rgbStrs[s.colorIdx];

            // Streak
            if (!isNaN(s.px) && !isNaN(s.py)) {
                ctx.globalAlpha = a * 0.5;
                ctx.strokeStyle = colStr;
                ctx.lineWidth   = Math.max(0.4, r * 0.4);
                ctx.beginPath();
                ctx.moveTo(s.px, s.py);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }

            // Dot head
            ctx.globalAlpha = a;
            ctx.fillStyle   = colStr;
            ctx.fillRect(sx - r, sy - r, r * 2, r * 2);

            // Sparkle extra square
            if (flashMult > 1) {
                const rf = Math.min(r * 1.4, maxR * 1.4);
                ctx.globalAlpha = a * 0.5;
                ctx.fillRect(sx - rf, sy - rf, rf * 2, rf * 2);
            }

            s.px = sx;
            s.py = sy;
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        elapsed += Math.min(0.1, Math.max(0, deltaSec));
    }

    // Respect reduced-motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        resize();
        for (let i = 0; i < 80; i++) drawFrame(1 / 60);
        return;
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let rafId;
    function loop(t) {
        const deltaSec = (t - lastT) / 1000;
        lastT = t;
        drawFrame(deltaSec);
        rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
}());

// ============================================================
// DOMContentLoaded — UI interactions
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // 1. Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');

    if (localStorage.getItem('theme') === 'light') {
        htmlEl.classList.replace('dark', 'light');
        themeIcon.classList.replace('ph-sun', 'ph-moon');
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = htmlEl.classList.contains('light');
        htmlEl.classList.replace(isLight ? 'light' : 'dark', isLight ? 'dark' : 'light');
        themeIcon.classList.replace(isLight ? 'ph-moon' : 'ph-sun', isLight ? 'ph-sun' : 'ph-moon');
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
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

    // 5. Reload Preview iframe
    const reloadBtn = document.getElementById('reload-preview-btn');
    const previewIframe = document.getElementById('preview-iframe');

    if (reloadBtn && previewIframe) {
        reloadBtn.addEventListener('click', () => {
            reloadBtn.style.cssText = 'transform: rotate(360deg); transition: transform 0.6s ease;';
            previewIframe.src = previewIframe.src;
            setTimeout(() => { reloadBtn.style.cssText = ''; }, 650);
        });
    }
});
