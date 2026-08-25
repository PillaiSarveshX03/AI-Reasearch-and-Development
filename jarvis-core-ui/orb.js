/**
 * JARVIS 3D Holographic Neural Core
 * Decibel-Reactive Particle & Neural Filament Sphere with Orbital Rings
 */

class JarvisOrb {
    constructor(containerId, audioAnalyzer) {
        this.container = document.getElementById(containerId);
        this.audioAnalyzer = audioAnalyzer;
        this.width = this.container.clientWidth || window.innerWidth;
        this.height = this.container.clientHeight || window.innerHeight;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Visual Groups
        this.coreGroup = new THREE.Group();
        this.ringGroup = new THREE.Group();
        this.particlesGroup = new THREE.Group();
        this.filamentsGroup = new THREE.Group();

        // Color Palette — Pure Orange only
        this.colors = {
            primary:   new THREE.Color(0xff8800),   // core orange
            secondary: new THREE.Color(0xff4400),   // deep burnt orange
            glow:      new THREE.Color(0xffbb55),   // warm amber highlight
            soft:      new THREE.Color(0xff6600)    // mid-tone orange
        };

        // Interaction & Animation State
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.time = 0;

        this.init();
    }

    init() {
        // 1. Scene Setup
        this.scene = new THREE.Scene();

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 3000);
        this.camera.position.z = 520;

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // 4. Glow Particle Texture (Off-screen canvas)
        this.glowTexture = this.createGlowTexture();

        // 5. Build Sub-components
        this.buildNeuralFilaments();
        this.buildInnerCoreParticles();
        this.buildOrbitalRings();
        this.buildOuterAura();

        // Assemble scene
        this.scene.add(this.coreGroup);
        this.coreGroup.add(this.filamentsGroup);
        this.coreGroup.add(this.particlesGroup);
        this.coreGroup.add(this.ringGroup);

        // 6. Listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });

        // 7. Start Loop
        this.animate();
    }

    createGlowTexture() {
        // Use a larger canvas for smoother falloff
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Very wide, soft gradient — pure orange tones, no white.
        // The key to eliminating sharp edges is:
        //   1. No opaque centre (max alpha ~0.9)
        //   2. Very gradual falloff starting from stop 0.0
        //   3. Fade to fully transparent well before the edge
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0.00, 'rgba(255, 160, 60, 0.90)');   // warm orange core, not white
        gradient.addColorStop(0.18, 'rgba(255, 120, 20, 0.65)');   // mid-orange
        gradient.addColorStop(0.40, 'rgba(255, 90,  10, 0.30)');   // fading orange
        gradient.addColorStop(0.65, 'rgba(220, 70,   0, 0.10)');   // near-transparent deep orange
        gradient.addColorStop(1.00, 'rgba(180, 50,   0, 0.00)');   // fully transparent edge

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        return new THREE.CanvasTexture(canvas);
    }

    /**
     * Builds intricate branching neural filaments wrapping across sphere
     */
    buildNeuralFilaments() {
        const radius = 120;
        const numFilaments = 200;
        const segmentsPerFilament = 26;
        const linePositions = [];
        const lineColors = [];

        const c1 = this.colors.primary;
        const c2 = this.colors.glow;
        const c3 = this.colors.secondary;

        for (let i = 0; i < numFilaments; i++) {
            let theta = Math.random() * Math.PI * 2;
            let phi = Math.acos(Math.random() * 2 - 1);
            let currentRadius = radius + (Math.random() - 0.5) * 10;

            let x = currentRadius * Math.sin(phi) * Math.cos(theta);
            let y = currentRadius * Math.sin(phi) * Math.sin(theta);
            let z = currentRadius * Math.cos(phi);

            for (let j = 0; j < segmentsPerFilament; j++) {
                const prevX = x;
                const prevY = y;
                const prevZ = z;

                theta += (Math.random() - 0.5) * 0.28;
                phi += (Math.random() - 0.5) * 0.28;
                currentRadius = radius + (Math.random() - 0.5) * 12;

                x = currentRadius * Math.sin(phi) * Math.cos(theta);
                y = currentRadius * Math.sin(phi) * Math.sin(theta);
                z = currentRadius * Math.cos(phi);

                linePositions.push(prevX, prevY, prevZ);
                linePositions.push(x, y, z);

                const col = (Math.random() > 0.35) ? c1 : ((Math.random() > 0.5) ? c2 : c3);
                lineColors.push(col.r, col.g, col.b);
                lineColors.push(col.r, col.g, col.b);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        this.filamentMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        this.filamentMesh = new THREE.LineSegments(geometry, this.filamentMaterial);
        this.filamentsGroup.add(this.filamentMesh);
    }

    /**
     * Dense glowing inner neural core
     */
    buildInnerCoreParticles() {
        const particleCount = 2600;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const primaryColor = this.colors.primary;
        const glowColor = this.colors.glow;
        const secondaryColor = this.colors.secondary;

        for (let i = 0; i < particleCount; i++) {
            const r = Math.pow(Math.random(), 1.6) * 115;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Use soft orange for dense inner core, primary for mid, secondary for outer edge
            const col = (r < 45) ? this.colors.glow : ((Math.random() > 0.4) ? primaryColor : secondaryColor);
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Larger particle size + sizeAttenuation off gives a much softer cloud-like boundary
        this.corePointsMaterial = new THREE.PointsMaterial({
            size: 10,            // bigger = each particle bleeds outward more
            vertexColors: true,
            transparent: true,
            opacity: 0.78,       // slightly lower so additive stacking stays soft
            map: this.glowTexture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.corePoints = new THREE.Points(geometry, this.corePointsMaterial);
        this.particlesGroup.add(this.corePoints);
    }

    /**
     * Prominent tilted orbital rings
     */
    buildOrbitalRings() {
        this.rings = [];

        const ringConfigs = [
            { radius: 140, tiltX: 0.65, tiltY: 0.45, speed: 0.014, count: 500, width: 6 },
            { radius: 148, tiltX: -0.55, tiltY: -0.35, speed: -0.018, count: 420, width: 7 },
            { radius: 135, tiltX: 0.15, tiltZ: 0.85, speed: 0.010, count: 320, width: 4 }
        ];

        ringConfigs.forEach((cfg) => {
            const ringObj = new THREE.Group();
            ringObj.rotation.x = cfg.tiltX;
            ringObj.rotation.y = cfg.tiltY || 0;
            if (cfg.tiltZ) ringObj.rotation.z = cfg.tiltZ;

            // Particles
            const pCount = cfg.count;
            const positions = new Float32Array(pCount * 3);
            const colors = new Float32Array(pCount * 3);

            const col = this.colors.glow;
            const subCol = this.colors.primary;

            for (let i = 0; i < pCount; i++) {
                const angle = (i / pCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
                const r = cfg.radius + (Math.random() - 0.5) * cfg.width;
                const z = (Math.random() - 0.5) * (cfg.width * 0.6);

                positions[i * 3] = r * Math.cos(angle);
                positions[i * 3 + 1] = r * Math.sin(angle);
                positions[i * 3 + 2] = z;

                const c = (Math.random() > 0.3) ? col : subCol;
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;
            }

            const pGeom = new THREE.BufferGeometry();
            pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            pGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const pMat = new THREE.PointsMaterial({
                size: 5.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.95,
                map: this.glowTexture,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const points = new THREE.Points(pGeom, pMat);
            ringObj.add(points);

            // Ring line
            const lineGeom = new THREE.BufferGeometry();
            const linePoints = [];
            const lSegments = 100;
            for (let i = 0; i <= lSegments; i++) {
                const angle = (i / lSegments) * Math.PI * 2;
                linePoints.push(cfg.radius * Math.cos(angle), cfg.radius * Math.sin(angle), 0);
            }
            lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
            const lineMat = new THREE.LineBasicMaterial({
                color: this.colors.glow,
                transparent: true,
                opacity: 0.65,
                blending: THREE.AdditiveBlending
            });
            const ringLine = new THREE.Line(lineGeom, lineMat);
            ringObj.add(ringLine);

            this.ringGroup.add(ringObj);
            this.rings.push({ group: ringObj, speed: cfg.speed, lineMat, pMat });
        });
    }

    /**
     * Ambient floating aura dust
     */
    buildOuterAura() {
        // More particles, spread further out, very large so they bleed into the background
        const count = 600;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const col = this.colors.secondary;  // deeper burnt orange for outer haze

        for (let i = 0; i < count; i++) {
            // Spread from 120 to 240 — overlapping the core edge creates a soft halo
            const r = 120 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Mix between secondary and primary based on distance
            const c = (r > 190) ? col : this.colors.primary;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.auraMat = new THREE.PointsMaterial({
            size: 18,           // very large — each aura particle is a wide soft bloom
            vertexColors: true,
            transparent: true,
            opacity: 0.18,      // low opacity so many overlapping ones create gradual fade
            map: this.glowTexture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.auraPoints = new THREE.Points(geom, this.auraMat);
        this.particlesGroup.add(this.auraPoints);
    }

    onMouseMove(e) {
        this.mouseX = (e.clientX - this.width / 2) / (this.width / 2);
        this.mouseY = (e.clientY - this.height / 2) / (this.height / 2);
        this.targetRotationY = this.mouseX * 0.55;
        this.targetRotationX = this.mouseY * 0.55;
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            this.mouseX = (e.touches[0].clientX - this.width / 2) / (this.width / 2);
            this.mouseY = (e.touches[0].clientY - this.height / 2) / (this.height / 2);
            this.targetRotationY = this.mouseX * 0.55;
            this.targetRotationX = this.mouseY * 0.55;
        }
    }

    onWindowResize() {
        this.width = this.container.clientWidth || window.innerWidth;
        this.height = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.time += 0.015;

        // 1. Fetch live voice decibel level (0.0 to 1.0)
        const decibel = this.audioAnalyzer ? this.audioAnalyzer.getLevel() : 0.0;

        // 2. Modulate visual glow & scale according to voice decibels
        // Idle breathing base: 1.0 + slight oscillation
        // Voice active: Expands up to 1.35x and brightens significantly
        const baseBreath = 1.0 + Math.sin(this.time * 2.0) * 0.02;
        const targetScale = baseBreath * (1.0 + decibel * 0.32);
        
        this.coreGroup.scale.set(targetScale, targetScale, targetScale);

        // 3. Dynamic Brightness & Opacity Modulation
        if (this.filamentMaterial) {
            this.filamentMaterial.opacity = 0.65 + decibel * 0.35;
        }
        if (this.corePointsMaterial) {
            this.corePointsMaterial.size = 5.5 + decibel * 5.0;
            this.corePointsMaterial.opacity = 0.8 + decibel * 0.2;
        }
        if (this.rings) {
            this.rings.forEach(r => {
                r.lineMat.opacity = 0.5 + decibel * 0.5;
                r.pMat.size = 4.8 + decibel * 4.0;
            });
        }

        // 4. Rotations & Dynamic Speed
        const speedMultiplier = 1.0 + decibel * 2.2;
        this.coreGroup.rotation.y += 0.0035 * speedMultiplier;
        this.coreGroup.rotation.x += (this.targetRotationX - this.coreGroup.rotation.x) * 0.05;
        this.coreGroup.rotation.z += (this.targetRotationY - this.coreGroup.rotation.z) * 0.05;

        if (this.filamentsGroup) {
            this.filamentsGroup.rotation.y -= 0.002 * speedMultiplier;
            this.filamentsGroup.rotation.z = Math.sin(this.time * 0.8) * (0.06 + decibel * 0.1);
        }

        if (this.rings) {
            this.rings.forEach((r, idx) => {
                r.group.rotation.z += r.speed * speedMultiplier;
                r.group.rotation.x += Math.cos(this.time * 0.5 + idx) * 0.002;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.JarvisOrb = JarvisOrb;
