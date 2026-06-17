/**
 * McDonald Tettey Botchway — Luxury Interactive Portfolio
 * Stack: React + Three.js (@react-three/fiber + @react-three/drei) + GSAP ScrollTrigger
 *
 * CAMERA VECTORS — adjust these to change each section's 3D view:
 *   SECTION 1 (Hero):      position [0, 0, 5]   — front view, centered
 *   SECTION 2 (Projects):  position [3, 2, 3]   — elevated side angle
 *   SECTION 3 (Skills):    position [0, 5, 1]   — top-down dramatic
 *   SECTION 4 (Contact):   position [-3, 1, 4]  — dynamic exit angle
 *
 * To swap in a real GLTF model:
 *   Replace <SceneModel /> with <GLTFModel url="/your-model.glb" />
 *   and use useGLTF('/your-model.glb') inside that component
 */

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Float, MeshDistortMaterial, Torus } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  void:    "#0A0A0A",
  panel:   "#111111",
  border:  "#222222",
  ivory:   "#F5F0E8",
  muted:   "#6B6560",
  gold:    "#C8A97E",
  goldDim: "#3D2E1A",
};

// ─── 8 PROJECTS ───────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: "01",
    tag: "AI / DATA SYSTEMS",
    title: "Conversational\nSales Agent",
    desc: "Natural-language queries over live sales data. Ask 'Which region underperformed?' — get instant answers via an LLM-powered agent backed by a real database.",
    stack: ["Python", "Streamlit", "Gemini API", "Supabase"],
    gradient: ["#1A2A1A", "#0D3D2A", "#3DDC97"],
    year: "2024",
  },
  {
    id: "02",
    tag: "NETWORK ENGINEERING",
    title: "Multi-Department\nIP Scheme",
    desc: "Complete CIDR subnetting plan for a multi-department organization — host range calculations, routing logic, and DHCP configuration for 6 VLANs.",
    stack: ["Subnetting", "CIDR", "Routing", "DHCP"],
    gradient: ["#0D1A2A", "#1A2A3D", "#4A9EFF"],
    year: "2024",
  },
  {
    id: "03",
    tag: "CYBERSECURITY",
    title: "Network Security\nAudit Framework",
    desc: "Structured methodology for assessing SME network vulnerabilities — port scanning, firewall rule analysis, and a remediation report template.",
    stack: ["Nmap", "Wireshark", "Security Policy"],
    gradient: ["#2A0D0D", "#3D1A1A", "#FF4A4A"],
    year: "2024",
  },
  {
    id: "04",
    tag: "SOFTWARE ENGINEERING",
    title: "Array Operations\nComplexity Toolkit",
    desc: "C++ library of core array algorithms — traversal, insertion, deletion — each benchmarked and documented with Big-O analysis for performance-aware coding.",
    stack: ["C++", "Algorithms", "Big-O Analysis"],
    gradient: ["#1A1A2A", "#2A1A3D", "#9B4AFF"],
    year: "2024",
  },
  {
    id: "05",
    tag: "DATABASE SYSTEMS",
    title: "Ghana SME\nCRM Database",
    desc: "Relational database schema and automation layer for small business client tracking — outreach logs, deal stages, and Google Apps Script pipeline.",
    stack: ["SQL", "Schema Design", "Apps Script"],
    gradient: ["#2A1A0D", "#3D2A0D", "#FFA94A"],
    year: "2025",
  },
  {
    id: "06",
    tag: "WEB DEVELOPMENT",
    title: "LectureAI\nStudy Platform",
    desc: "AI-powered lecture companion app preloaded with 7 GCTU courses — auto-generates quizzes, summaries, and study notes from recorded lectures.",
    stack: ["React", "Claude API", "JSX"],
    gradient: ["#0D2A2A", "#0D3D3D", "#4AFFEE"],
    year: "2025",
  },
  {
    id: "07",
    tag: "IT INFRASTRUCTURE",
    title: "Home Lab\nSecurity Setup",
    desc: "Virtualized security home lab — pfSense firewall, Kali Linux attack machine, and a vulnerable target VM for practicing penetration testing techniques.",
    stack: ["pfSense", "Kali Linux", "VirtualBox"],
    gradient: ["#1A2A0D", "#2A3D0D", "#A9FF4A"],
    year: "2025",
  },
  {
    id: "08",
    tag: "AUTOMATION",
    title: "Client Outreach\nAutomation System",
    desc: "End-to-end freelance outreach pipeline — CRM workbook, automated follow-up emails via Google Apps Script, targeting Accra-based tech companies.",
    stack: ["Apps Script", "Gmail API", "Excel"],
    gradient: ["#2A0D1A", "#3D0D2A", "#FF4ABA"],
    year: "2025",
  },
];

// ─── 3D SCENE MODEL ───────────────────────────────────────────────────────────
// Replace this with useGLTF('/your-model.glb') when you have a real asset
function SceneModel({ scrollProgress }) {
  const groupRef = useRef();
  const torusRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Ambient rotation — always slowly spinning
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.07) * 0.15;

    // Inner torus counter-rotates for complexity
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.25;
      innerRef.current.rotation.z = t * 0.18;
    }

    // Pulse distortion on scroll
    if (torusRef.current?.material) {
      torusRef.current.material.distort = 0.2 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer torus knot — the signature shape */}
      <mesh ref={torusRef}>
        <torusKnotGeometry args={[1.2, 0.35, 200, 32, 2, 3]} />
        <MeshDistortMaterial
          color="#C8A97E"
          metalness={0.95}
          roughness={0.05}
          distort={0.2}
          speed={2}
          envMapIntensity={2}
          wireframe={false}
        />
      </mesh>

      {/* Inner torus ring */}
      <mesh ref={innerRef}>
        <torusGeometry args={[1.8, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#C8A97E"
          metalness={1}
          roughness={0}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Outer orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.02, 8, 100]} />
        <meshStandardMaterial
          color="#C8A97E"
          metalness={1}
          roughness={0}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Particle field — small gold spheres orbiting */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = 2.8 + Math.sin(i * 1.3) * 0.4;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              Math.sin(i * 0.7) * 0.8,
              Math.sin(angle) * r,
            ]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#C8A97E" metalness={1} roughness={0} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── CAMERA CONTROLLER ────────────────────────────────────────────────────────
// This is where GSAP ScrollTrigger drives the camera
const CAMERA_KEYFRAMES = [
  // Section 1 — Hero: front view
  { position: [0, 0, 5.5],   lookAt: [0, 0, 0] },
  // Section 2 — Projects: elevated side, slight macro
  { position: [3.5, 2.5, 3], lookAt: [0, 0, 0] },
  // Section 3 — Skills: top-down dramatic
  { position: [0.5, 5.5, 1], lookAt: [0, 0, 0] },
  // Section 4 — Contact: dynamic exit, low angle
  { position: [-3, -1.5, 4], lookAt: [0, 0.5, 0] },
];

function CameraRig() {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const targetPos = useRef(new THREE.Vector3(0, 0, 5.5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 5.5);
    camera.lookAt(0, 0, 0);

    // Bind scroll progress to camera
    const onProgress = (e) => {
      progressRef.current = e.detail;
    };
    window.addEventListener("cameraProgress", onProgress);
    return () => window.removeEventListener("cameraProgress", onProgress);
  }, [camera]);

  useFrame(() => {
    const progress = progressRef.current; // 0 → 1 over full scroll
    const sections = CAMERA_KEYFRAMES.length - 1;
    const sectionF = progress * sections;
    const sectionI = Math.min(Math.floor(sectionF), sections - 1);
    const t = sectionF - sectionI;

    const from = CAMERA_KEYFRAMES[sectionI];
    const to   = CAMERA_KEYFRAMES[sectionI + 1] || CAMERA_KEYFRAMES[sectionI];

    // Lerp camera position
    targetPos.current.set(
      THREE.MathUtils.lerp(from.position[0], to.position[0], t),
      THREE.MathUtils.lerp(from.position[1], to.position[1], t),
      THREE.MathUtils.lerp(from.position[2], to.position[2], t),
    );
    targetLook.current.set(
      THREE.MathUtils.lerp(from.lookAt[0], to.lookAt[0], t),
      THREE.MathUtils.lerp(from.lookAt[1], to.lookAt[1], t),
      THREE.MathUtils.lerp(from.lookAt[2], to.lookAt[2], t),
    );

    camera.position.lerp(targetPos.current, 0.06);
    camera.lookAt(targetLook.current);
  });

  return null;
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef();

  return (
    <div
      ref={cardRef}
      className="project-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})`
          : T.panel,
        border: `1px solid ${hovered ? project.gradient[2] + "44" : T.border}`,
        borderRadius: "2px",
        padding: "32px",
        cursor: "default",
        transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent line top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: hovered ? project.gradient[2] : "transparent",
        transition: "background 0.4s ease",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.2em",
          color: hovered ? project.gradient[2] : T.muted,
          transition: "color 0.4s ease",
        }}>
          {project.tag}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          color: T.muted,
        }}>
          {project.year}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(22px, 2.5vw, 30px)",
        fontWeight: 600,
        color: T.ivory,
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        margin: "0 0 16px 0",
        whiteSpace: "pre-line",
      }}>
        {project.title}
      </h3>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        color: T.muted,
        lineHeight: 1.7,
        margin: "0 0 24px 0",
      }}>
        {project.desc}
      </p>

      {/* Image placeholder — gradient visual */}
      <div style={{
        height: "120px",
        borderRadius: "2px",
        background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]}, ${project.gradient[2]}22)`,
        border: `1px solid ${project.gradient[2]}22`,
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Animated grid lines in card image area */}
        <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.15 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`}
              stroke={project.gradient[2]} strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 14.28}%`} y1="0" x2={`${i * 14.28}%`} y2="100%"
              stroke={project.gradient[2]} strokeWidth="0.5" />
          ))}
        </svg>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "48px",
          fontWeight: 300,
          color: project.gradient[2],
          opacity: 0.4,
          zIndex: 1,
        }}>{project.id}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {project.stack.map((s) => (
          <span key={s} style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "10px",
            padding: "4px 10px",
            border: `1px solid ${T.border}`,
            borderRadius: "1px",
            color: T.muted,
            letterSpacing: "0.05em",
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LuxuryPortfolio() {
  const containerRef = useRef();
  const heroRef = useRef();
  const projectsRef = useRef();
  const skillsRef = useRef();
  const contactRef = useRef();
  const cursorRef = useRef();
  const cursorDotRef = useRef();
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [scrollPct, setScrollPct] = useState(0);

  // ── Custom cursor
  useEffect(() => {
    const move = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ── GSAP ScrollTrigger setup
  useEffect(() => {
    const ctx = gsap.context(() => {

      // Drive camera via scroll progress event
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          setScrollPct(self.progress);
          window.dispatchEvent(
            new CustomEvent("cameraProgress", { detail: self.progress })
          );
        },
      });

      // ── Hero text reveal
      gsap.fromTo(".hero-eyebrow",
        { opacity: 0, y: 30, letterSpacing: "0.5em" },
        { opacity: 1, y: 0, letterSpacing: "0.25em", duration: 1.4, ease: "expo.out", delay: 0.3 }
      );
      gsap.fromTo(".hero-name",
        { opacity: 0, y: 60, skewY: 3 },
        { opacity: 1, y: 0, skewY: 0, duration: 1.6, ease: "expo.out", delay: 0.5 }
      );
      gsap.fromTo(".hero-title",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", delay: 0.8 }
      );
      gsap.fromTo(".hero-line",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.2, ease: "expo.out", delay: 1.0 }
      );
      gsap.fromTo(".hero-desc",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 1.2 }
      );
      gsap.fromTo(".hero-scroll-hint",
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 2.5 }
      );

      // ── Projects section reveal
      gsap.fromTo(".projects-heading",
        { opacity: 0, x: -60 },
        {
          opacity: 1, x: 0, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: ".projects-heading", start: "top 80%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".project-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: ".projects-grid", start: "top 75%", toggleActions: "play none none none" }
        }
      );

      // ── Skills section
      gsap.fromTo(".skills-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: ".skills-heading", start: "top 80%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".skill-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: "expo.out", stagger: 0.08,
          scrollTrigger: { trigger: ".skills-grid", start: "top 75%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".skill-bar-fill",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.2, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: ".skills-grid", start: "top 70%", toggleActions: "play none none none" }
        }
      );

      // ── Contact reveal
      gsap.fromTo(".contact-heading",
        { opacity: 0, y: 60, skewY: 2 },
        {
          opacity: 1, y: 0, skewY: 0, duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: ".contact-heading", start: "top 80%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".contact-detail",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.15,
          scrollTrigger: { trigger: ".contact-details", start: "top 80%", toggleActions: "play none none none" }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const skills = [
    { name: "Networking & Subnetting", level: 85, detail: "CIDR · DHCP · Routing" },
    { name: "Cybersecurity Fundamentals", level: 80, detail: "Cisco Certified" },
    { name: "C++ / Java Programming", level: 75, detail: "Data Structures & Algorithms" },
    { name: "Database Systems", level: 70, detail: "SQL · Schema Design" },
    { name: "Python & Automation", level: 65, detail: "Scripting · APIs" },
    { name: "Technical Documentation", level: 90, detail: "Reports · Policy Docs" },
  ];

  return (
    <div ref={containerRef} style={{ background: T.void, color: T.ivory, minHeight: "500vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: auto; }
        body { overflow-x: hidden; }
        ::selection { background: ${T.gold}33; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: ${T.void}; }
        ::-webkit-scrollbar-thumb { background: ${T.gold}; }

        /* Hide default cursor */
        * { cursor: none !important; }

        .luxury-canvas {
          position: fixed !important;
          top: 0; left: 0;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 0;
        }

        .scroll-sections {
          position: relative;
          z-index: 10;
          pointer-events: none;
        }
        .scroll-sections a,
        .scroll-sections button,
        .scroll-sections .project-card,
        .scroll-sections input,
        .scroll-sections textarea {
          pointer-events: all;
        }

        /* NAV */
        .luxury-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 48px;
          mix-blend-mode: normal;
        }

        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: ${T.ivory};
          text-decoration: none;
        }
        .nav-logo span { color: ${T.gold}; }

        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-link {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: ${T.muted};
          text-decoration: none;
          transition: color 0.3s ease;
          pointer-events: all;
        }
        .nav-link:hover { color: ${T.ivory}; }

        /* PROGRESS LINE */
        .progress-line {
          position: fixed;
          top: 0; left: 0;
          height: 1px;
          background: ${T.gold};
          z-index: 200;
          transform-origin: left;
          transition: none;
        }

        /* SECTION BASE */
        .section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 48px 80px;
        }

        /* HERO */
        .hero-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.25em;
          color: ${T.gold};
          margin-bottom: 24px;
          opacity: 0;
        }
        .hero-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 8vw, 110px);
          font-weight: 600;
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: ${T.ivory};
          opacity: 0;
          margin-bottom: 8px;
        }
        .hero-name em {
          font-style: italic;
          font-weight: 300;
          color: ${T.gold};
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 2.5vw, 28px);
          font-weight: 300;
          font-style: italic;
          color: ${T.muted};
          opacity: 0;
          margin-bottom: 32px;
        }
        .hero-line {
          width: 80px;
          height: 1px;
          background: ${T.gold};
          margin-bottom: 28px;
          opacity: 1;
        }
        .hero-desc {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: ${T.muted};
          line-height: 1.8;
          max-width: 380px;
          opacity: 0;
          margin-bottom: 48px;
        }

        .hero-scroll-hint {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
        }
        .scroll-hint-line {
          width: 40px;
          height: 1px;
          background: ${T.gold};
          animation: expandLine 2s ease-in-out infinite;
        }
        @keyframes expandLine {
          0%, 100% { width: 40px; opacity: 0.4; }
          50% { width: 60px; opacity: 1; }
        }
        .scroll-hint-text {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: ${T.muted};
        }

        /* SECTION EYEBROW */
        .section-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: ${T.gold};
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .section-eyebrow::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: ${T.gold};
          opacity: 0.4;
        }

        .section-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 6vw, 80px);
          font-weight: 600;
          line-height: 1.0;
          letter-spacing: -0.02em;
          color: ${T.ivory};
          margin-bottom: 16px;
        }
        .section-heading em {
          font-style: italic;
          font-weight: 300;
          color: ${T.gold};
        }
        .section-sub {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: ${T.muted};
          line-height: 1.7;
          max-width: 440px;
          margin-bottom: 60px;
        }

        /* PROJECTS GRID */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        /* SKILLS */
        .skills-grid {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .skill-item {
          display: grid;
          grid-template-columns: 1fr 120px auto;
          align-items: center;
          gap: 24px;
          padding: 20px 0;
          border-bottom: 1px solid ${T.border};
        }
        .skill-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 400;
          color: ${T.ivory};
          letter-spacing: 0.01em;
        }
        .skill-bar {
          height: 1px;
          background: ${T.border};
          position: relative;
          overflow: visible;
        }
        .skill-bar-fill {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          background: ${T.gold};
          transform-origin: left;
        }
        .skill-detail {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: ${T.muted};
          letter-spacing: 0.08em;
          text-align: right;
          white-space: nowrap;
        }

        /* CONTACT */
        .contact-form-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid ${T.border};
          padding: 16px 0;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: ${T.ivory};
          outline: none;
          transition: border-color 0.3s ease;
          margin-bottom: 24px;
        }
        .contact-form-input::placeholder { color: ${T.muted}; }
        .contact-form-input:focus { border-bottom-color: ${T.gold}; }

        .send-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          background: none;
          border: 1px solid ${T.gold};
          color: ${T.gold};
          padding: 16px 32px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.15em;
          transition: all 0.4s ease;
          margin-top: 16px;
        }
        .send-btn:hover {
          background: ${T.gold};
          color: ${T.void};
          cursor: none;
        }
        .send-btn-line {
          width: 24px;
          height: 1px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        .send-btn:hover .send-btn-line { width: 40px; }

        /* CUSTOM CURSOR */
        .cursor-ring {
          position: fixed;
          width: 36px;
          height: 36px;
          border: 1px solid ${T.gold};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.15s ease, opacity 0.3s ease;
          transform: translate(-50%, -50%);
        }
        .cursor-dot {
          position: fixed;
          width: 4px;
          height: 4px;
          background: ${T.gold};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
        }

        /* DIVIDER */
        .luxury-divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, ${T.border}, transparent);
          align-self: stretch;
          margin: 0 48px;
        }

        /* FOOTER */
        .luxury-footer {
          padding: 60px 48px;
          border-top: 1px solid ${T.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-copy {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: ${T.muted};
        }

        @media (max-width: 768px) {
          .luxury-nav { padding: 20px 24px; }
          .nav-links { display: none; }
          .section { padding: 100px 24px 60px; }
          .projects-grid { grid-template-columns: 1fr; }
          .skill-item { grid-template-columns: 1fr; gap: 8px; }
          .luxury-footer { padding: 40px 24px; flex-direction: column; gap: 16px; }
        }
      `}</style>

      {/* ── CUSTOM CURSOR */}
      <div className="cursor-ring" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* ── SCROLL PROGRESS */}
      <div className="progress-line" style={{ width: `${scrollPct * 100}%` }} />

      {/* ── FIXED 3D CANVAS */}
      <Canvas
        className="luxury-canvas"
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#C8A97E" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A6EFF" />
        <pointLight position={[0, 10, -10]} intensity={0.8} color="#ffffff" />
        <Suspense fallback={null}>
          <Environment preset="night" />
          <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
            <SceneModel />
          </Float>
        </Suspense>
        <CameraRig />
      </Canvas>

      {/* ── NAVIGATION */}
      <nav className="luxury-nav">
        <a href="#" className="nav-logo">MTB<span>.</span></a>
        <ul className="nav-links">
          <li><a href="#projects" className="nav-link">WORK</a></li>
          <li><a href="#skills" className="nav-link">SKILLS</a></li>
          <li><a href="#contact" className="nav-link">CONTACT</a></li>
        </ul>
      </nav>

      {/* ── SCROLL SECTIONS */}
      <div className="scroll-sections">

        {/* ════════════════════════════════════════
            SECTION 1 — HERO
            Camera: [0, 0, 5.5] — full front view
        ════════════════════════════════════════ */}
        <section className="section" ref={heroRef} style={{ minHeight: "100vh" }}>
          <div style={{ maxWidth: "560px" }}>
            <div className="hero-eyebrow">STATUS — OPEN FOR WORK</div>
            <h1 className="hero-name">
              McDonald<br />
              <em>Tettey</em><br />
              Botchway
            </h1>
            <div className="hero-title">IT Student & Cybersecurity Developer</div>
            <div className="hero-line" />
            <p className="hero-desc">
              Level 200 BSc IT at GCTU, Accra. Cisco-certified in cybersecurity.
              I build networks, secure systems, and write the code that connects them.
            </p>
            <div className="hero-scroll-hint">
              <div className="scroll-hint-line" />
              <span className="scroll-hint-text">SCROLL TO EXPLORE</span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 2 — PROJECTS
            Camera: [3.5, 2.5, 3] — elevated side angle
        ════════════════════════════════════════ */}
        <section id="projects" className="section" ref={projectsRef}
          style={{ minHeight: "auto", paddingTop: "120px", paddingBottom: "120px", display: "block" }}>
          <div>
            <div className="section-eyebrow projects-heading">SELECTED WORK</div>
            <h2 className="section-heading projects-heading">
              Things I've<br /><em>built.</em>
            </h2>
            <p className="section-sub projects-heading">
              Eight projects spanning AI systems, network engineering, cybersecurity,
              and software development — the full stack of what I do.
            </p>
            <div className="projects-grid">
              {PROJECTS.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 3 — SKILLS
            Camera: [0.5, 5.5, 1] — top-down dramatic
        ════════════════════════════════════════ */}
        <section id="skills" className="section" ref={skillsRef}
          style={{ minHeight: "100vh", display: "block", paddingTop: "120px" }}>
          <div style={{ maxWidth: "720px" }}>
            <div className="section-eyebrow skills-heading">CAPABILITIES</div>
            <h2 className="section-heading skills-heading">
              What I<br /><em>master.</em>
            </h2>
            <p className="section-sub skills-heading">
              A foundation built on networking and security, extended
              through programming, databases, and automation.
            </p>
            <div className="skills-grid">
              {skills.map((s, i) => (
                <div key={s.name} className="skill-item">
                  <span className="skill-name">{s.name}</span>
                  <div className="skill-bar">
                    <div className="skill-bar-fill" style={{ width: `${s.level}%` }} />
                  </div>
                  <span className="skill-detail">{s.detail}</span>
                </div>
              ))}
            </div>

            {/* Certification badge */}
            <div style={{
              marginTop: "60px",
              padding: "28px 32px",
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              gap: "24px",
            }}>
              <div style={{
                width: "48px", height: "48px",
                border: `1px solid ${T.gold}`,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: T.gold, fontSize: "18px", fontFamily: "'Cormorant Garamond', serif" }}>✦</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", color: T.gold, marginBottom: "4px" }}>
                  CERTIFIED
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: T.ivory }}>
                  Cisco Networking Academy — Introduction to Cybersecurity
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 4 — CONTACT
            Camera: [-3, -1.5, 4] — dynamic exit angle
        ════════════════════════════════════════ */}
        <section id="contact" className="section" ref={contactRef}
          style={{ minHeight: "100vh", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "960px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>

              {/* Left — heading */}
              <div>
                <div className="section-eyebrow contact-heading">LET'S CONNECT</div>
                <h2 className="section-heading contact-heading">
                  Have a<br /><em>project?</em>
                </h2>
                <p className="section-sub contact-heading" style={{ marginBottom: "40px" }}>
                  Open to freelance work in networking, security assessments,
                  and software projects. Based in Accra, available globally.
                </p>

                <div className="contact-details">
                  {[
                    { label: "EMAIL", value: "mcdonaldbotchway18@gmail.com" },
                    { label: "PHONE", value: "+233 504 326 894" },
                    { label: "LOCATION", value: "Accra, Ghana" },
                    { label: "AVAILABILITY", value: "Open to opportunities" },
                  ].map((d) => (
                    <div key={d.label} className="contact-detail" style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "16px 0",
                      borderBottom: `1px solid ${T.border}`,
                    }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", color: T.muted }}>
                        {d.label}
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: T.ivory, fontWeight: 300 }}>
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — contact form */}
              <div>
                <ContactFormSection />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER */}
      <footer className="luxury-footer" style={{ position: "relative", zIndex: 10 }}>
        <span className="footer-copy">© 2026 MCDONALD TETTEY BOTCHWAY</span>
        <span className="footer-copy" style={{ color: T.gold }}>BUILT WITH REACT + THREE.JS</span>
      </footer>
    </div>
  );
}

// ─── CONTACT FORM (Web3Forms) ──────────────────────────────────────────────────
const WEB3FORMS_KEY = "28f842bd-5fb8-4be8-b44d-42c4f576695e";

function ContactFormSection() {
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const data = new FormData(e.target);
    data.append("access_key", WEB3FORMS_KEY);
    data.append("subject", "New portfolio enquiry — McDonald Tettey Botchway");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST", body: data, headers: { Accept: "application/json" },
      });
      const json = await res.json();
      setStatus(json.success ? "sent" : "error");
      if (json.success) e.target.reset();
    } catch { setStatus("error"); }
  }

  if (status === "sent") return (
    <div style={{ padding: "40px 0" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#C8A97E", marginBottom: "12px" }}>
        Message received.
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "0.15em", color: "#6B6560" }}>
        I'LL BE IN TOUCH SHORTLY.
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ paddingTop: "8px" }}>
      <input name="name" required placeholder="Your name" className="contact-form-input" />
      <input name="email" type="email" required placeholder="Email address" className="contact-form-input" />
      <textarea name="message" required placeholder="Tell me about your project..." rows={4}
        className="contact-form-input" style={{ resize: "vertical", fontFamily: "'Inter', sans-serif" }} />
      <button type="submit" className="send-btn" disabled={status === "sending"}>
        {status === "sending" ? "SENDING" : "SEND MESSAGE"}
        <div className="send-btn-line" />
      </button>
      {status === "error" && (
        <div style={{ marginTop: "12px", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#FF4A4A", letterSpacing: "0.1em" }}>
          ERROR — TRY EMAILING DIRECTLY
        </div>
      )}
    </form>
  );
}
