(() => {
    "use strict";

    document.getElementById("year").textContent = new Date().getFullYear();

    /* ---------- Mobile nav ---------- */
    const navToggle = document.getElementById("navToggle");
    const navList = document.getElementById("navList");
    if (navToggle && navList) {
        navToggle.addEventListener("click", () => {
            const open = navList.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(open));
        });
        navList.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navList.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------- Skill filters ---------- */
    const filterButtons = document.querySelectorAll(".filter-btn");
    const chips = document.querySelectorAll(".chip");
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => {
                b.classList.remove("is-active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("is-active");
            btn.setAttribute("aria-selected", "true");
            const filter = btn.dataset.filter;
            chips.forEach((chip) => {
                const show = filter === "all" || chip.dataset.cat === filter;
                chip.classList.toggle("is-hidden", !show);
            });
        });
    });

    /* ---------- Scroll reveal ---------- */
    const revealTargets = document.querySelectorAll(
        ".panel, .project-card, .cert-card, .about-stats li"
    );
    revealTargets.forEach((el) => el.classList.add("reveal"));

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealTargets.forEach((el) => io.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add("is-visible"));
    }

    /* ---------- Scrollspy ---------- */
    const spySections = document.querySelectorAll("main section[id]");
    const spyLinks = document.querySelectorAll(".nav-list a[href^='#']");
    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    spyLinks.forEach((link) => {
                        link.classList.toggle(
                            "is-active",
                            link.getAttribute("href") === "#" + id
                        );
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        spySections.forEach((s) => spy.observe(s));
    }

    /* ---------- Network / starfield background ---------- */
    const canvas = document.getElementById("net-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let width, height, dpr;
    let nodes = [];

    const NODE_COLOR = "rgba(148, 178, 255, 0.9)";
    const LINE_COLOR = "73, 230, 196";
    const LINK_DIST = 130;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seedNodes();
    }

    function seedNodes() {
        const density = Math.min(
            120,
            Math.floor((width * height) / 15000)
        );
        nodes = Array.from({ length: density }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            r: Math.random() * 1.1 + 0.4,
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
        }

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    const alpha = (1 - dist / LINK_DIST) * 0.35;
                    ctx.strokeStyle = `rgba(${LINE_COLOR}, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = NODE_COLOR;
        for (const n of nodes) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!prefersReducedMotion) {
            requestAnimationFrame(step);
        }
    }

    window.addEventListener("resize", resize, { passive: true });

    resize();
    if (prefersReducedMotion) {
        step(); // draw a single static frame
    } else {
        requestAnimationFrame(step);
    }
})();
