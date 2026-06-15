import React, { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  bg: "#0A0E14",
  panel: "#11161F",
  panelBorder: "#1F2733",
  text: "#E8ECF1",
  muted: "#5B6B8C",
  accent: "#3DDC97",
  accentDim: "#1E5C44",
};

// ---------------------------------------------------------------------------
// Network topology canvas — the signature element
// Nodes = skill domains. Pulses = data packets traveling the network.
// ---------------------------------------------------------------------------
function NetworkCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h;

    const nodes = [
      { label: "NETWORKING", x: 0.18, y: 0.3 },
      { label: "SECURITY", x: 0.5, y: 0.15 },
      { label: "SYSTEMS", x: 0.82, y: 0.32 },
      { label: "DATABASES", x: 0.25, y: 0.72 },
      { label: "PROGRAMMING", x: 0.6, y: 0.68 },
      { label: "CLOUD", x: 0.88, y: 0.78 },
    ];

    const edges = [
      [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [2, 5], [0, 4],
    ];

    // Packets traveling along edges
    const packets = edges.map((e, i) => ({
      edge: e,
      t: Math.random(),
      speed: 0.0025 + Math.random() * 0.003,
      delay: i * 40,
    }));

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width * window.devicePixelRatio;
      h = canvas.height = rect.height * window.devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    function pos(node) {
      return { x: node.x * w, y: node.y * h };
    }

    let frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Edges
      ctx.lineWidth = Math.max(1, window.devicePixelRatio * 1);
      edges.forEach(([a, b]) => {
        const pa = pos(nodes[a]);
        const pb = pos(nodes[b]);
        ctx.strokeStyle = "rgba(91, 107, 140, 0.25)";
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Packets
      packets.forEach((p) => {
        if (frame < p.delay) return;
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        const pa = pos(nodes[p.edge[0]]);
        const pb = pos(nodes[p.edge[1]]);
        const x = pa.x + (pb.x - pa.x) * p.t;
        const y = pa.y + (pb.y - pa.y) * p.t;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, 8 * window.devicePixelRatio);
        grad.addColorStop(0, "rgba(61, 220, 151, 0.9)");
        grad.addColorStop(1, "rgba(61, 220, 151, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 8 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.accent;
        ctx.beginPath();
        ctx.arc(x, y, 1.8 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });

      // Nodes
      nodes.forEach((node) => {
        const p = pos(node);
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hover = Math.max(0, 1 - dist / (140 * window.devicePixelRatio));

        const baseR = 4 * window.devicePixelRatio;
        const r = baseR + hover * 3 * window.devicePixelRatio;

        // glow ring
        ctx.strokeStyle = `rgba(61, 220, 151, ${0.25 + hover * 0.5})`;
        ctx.lineWidth = window.devicePixelRatio;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 6 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = hover > 0.05 ? COLORS.accent : "#3A4A63";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * window.devicePixelRatio,
        y: (e.clientY - rect.top) * window.devicePixelRatio,
      };
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { x: -1000, y: -1000 };
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  const labels = [
    { label: "NETWORKING", x: "18%", y: "30%" },
    { label: "SECURITY", x: "50%", y: "15%" },
    { label: "SYSTEMS", x: "82%", y: "32%" },
    { label: "DATABASES", x: "25%", y: "72%" },
    { label: "PROGRAMMING", x: "60%", y: "68%" },
    { label: "CLOUD", x: "88%", y: "78%" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.9 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {labels.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: l.x,
            top: l.y,
            transform: "translate(-50%, 14px)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.15em",
            color: COLORS.muted,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {l.label}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reveal-on-scroll wrapper
// ---------------------------------------------------------------------------
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section heading w/ eyebrow + index
// ---------------------------------------------------------------------------
function SectionHeading({ index, title, sub }) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          letterSpacing: "0.2em",
          color: COLORS.accent,
          marginBottom: "12px",
        }}
      >
        {index}
      </div>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          margin: 0,
          color: COLORS.text,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "16px",
            color: COLORS.muted,
            marginTop: "12px",
            maxWidth: "520px",
            lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill bar
// ---------------------------------------------------------------------------
function SkillBar({ name, level, detail }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: COLORS.text, fontWeight: 500 }}>
          {name}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: COLORS.muted }}>
          {detail}
        </span>
      </div>
      <div style={{ height: "4px", background: COLORS.panelBorder, borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: visible ? `${level}%` : "0%",
            background: `linear-gradient(90deg, ${COLORS.accentDim}, ${COLORS.accent})`,
            borderRadius: "2px",
            transition: "width 1.1s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------
function ProjectCard({ tag, title, desc, stack }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: COLORS.panel,
        border: `1px solid ${hover ? COLORS.accent : COLORS.panelBorder}`,
        borderRadius: "10px",
        padding: "28px",
        transition: "border-color 0.3s ease, transform 0.3s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        cursor: "default",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: COLORS.accent,
          marginBottom: "14px",
        }}
      >
        {tag}
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          color: COLORS.text,
          margin: "0 0 10px 0",
        }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: COLORS.muted, lineHeight: 1.6, margin: "0 0 18px 0" }}>
        {desc}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {stack.map((s) => (
          <span
            key={s}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "100px",
              border: `1px solid ${COLORS.panelBorder}`,
              color: COLORS.muted,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typewriter effect for hero subline
// ---------------------------------------------------------------------------
function Typewriter({ text, speed = 35 }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <>{shown}<span style={{ opacity: shown.length < text.length ? 1 : 0, color: COLORS.accent }}>▍</span></>;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function Portfolio() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        a { color: inherit; }
        .nav-link { position: relative; text-decoration: none; color: ${COLORS.muted}; font-size: 13px; letter-spacing: 0.05em; transition: color 0.2s ease; }
        .nav-link:hover { color: ${COLORS.text}; }
        .nav-link:focus-visible, .btn:focus-visible { outline: 2px solid ${COLORS.accent}; outline-offset: 3px; }
        .btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(61,220,151,0.18); }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px clamp(20px, 6vw, 80px)",
          background: "rgba(10,14,20,0.7)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${COLORS.panelBorder}`,
        }}
      >
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "0.02em" }}>
          D.O<span style={{ color: COLORS.accent }}>_</span>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          <a className="nav-link" href="#work">WORK</a>
          <a className="nav-link" href="#skills">SKILLS</a>
          <a className="nav-link" href="#contact">CONTACT</a>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(20px, 6vw, 80px)",
        }}
      >
        <NetworkCanvas />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "640px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              letterSpacing: "0.2em",
              color: COLORS.accent,
              marginBottom: "20px",
            }}
          >
            STATUS: OPEN FOR WORK
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(40px, 7vw, 76px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 24px 0",
            }}
          >
            Donald Botchway
          </h1>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(14px, 2vw, 18px)",
              color: COLORS.muted,
              minHeight: "28px",
              marginBottom: "28px",
            }}
          >
            <Typewriter text="IT student & cybersecurity-focused developer, building secure systems from the ground up." />
          </div>
          <p style={{ fontSize: "15px", color: COLORS.muted, lineHeight: 1.7, marginBottom: "36px", maxWidth: "480px" }}>
            Level 200 BSc Information Technology at GCTU, Cisco-certified in cybersecurity. I build networks,
            secure systems, and write the code that connects them.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a
              href="#work"
              className="btn"
              style={{
                background: COLORS.accent,
                color: "#0A0E14",
                padding: "14px 28px",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              View Work
            </a>
            <a
              href="#contact"
              className="btn"
              style={{
                border: `1px solid ${COLORS.panelBorder}`,
                color: COLORS.text,
                padding: "14px 28px",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: "100px clamp(20px, 6vw, 80px)", borderTop: `1px solid ${COLORS.panelBorder}` }}>
        <Reveal>
          <SectionHeading
            index="01 — CAPABILITIES"
            title="What I work with"
            sub="A foundation in networking and security, paired with the programming skills to build and automate around them."
          />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "48px", maxWidth: "980px" }}>
          <Reveal delay={50}>
            <div>
              <SkillBar name="Networking & Subnetting" level={85} detail="CIDR · DHCP · Routing" />
              <SkillBar name="Cybersecurity Fundamentals" level={80} detail="Cisco Certified" />
              <SkillBar name="C++ / Java" level={75} detail="Data Structures & Algorithms" />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div>
              <SkillBar name="Database Systems" level={70} detail="SQL · Schema Design" />
              <SkillBar name="Python & Automation" level={65} detail="Scripting · APIs" />
              <SkillBar name="Documentation & Reporting" level={90} detail="Technical Writing" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="work" style={{ padding: "100px clamp(20px, 6vw, 80px)", borderTop: `1px solid ${COLORS.panelBorder}` }}>
        <Reveal>
          <SectionHeading
            index="02 — SELECTED WORK"
            title="Things I've built"
            sub="A mix of AI tooling, network engineering, and software fundamentals — the building blocks of secure, working systems."
          />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <Reveal delay={50}>
            <ProjectCard
              tag="AI / DATA SYSTEMS"
              title="Conversational Sales Analytics Agent"
              desc="An AI-powered Streamlit app that lets business owners ask natural-language questions about their sales data — 'Which region underperformed last month?' — and get instant answers, backed by a live database and an LLM agent."
              stack={["Python", "Streamlit", "Gemini API", "Supabase"]}
            />
          </Reveal>
          <Reveal delay={150}>
            <ProjectCard
              tag="NETWORK ENGINEERING"
              title="Multi-Department IP Addressing Scheme"
              desc="Designed a complete subnetting plan for a multi-department organization — CIDR allocation, host range calculations, and routing logic — the same groundwork used to plan secure, scalable office networks."
              stack={["Subnetting", "CIDR", "Routing", "DHCP"]}
            />
          </Reveal>
          <Reveal delay={250}>
            <ProjectCard
              tag="SOFTWARE ENGINEERING"
              title="Array Operations & Complexity Toolkit"
              desc="A C++ library implementing core array algorithms — traversal, insertion, deletion — each benchmarked and documented with Big-O complexity analysis, demonstrating performance-aware coding fundamentals."
              stack={["C++", "Algorithms", "Big-O Analysis"]}
            />
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "100px clamp(20px, 6vw, 80px)", borderTop: `1px solid ${COLORS.panelBorder}` }}>
        <Reveal>
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.panelBorder}`,
              borderRadius: "16px",
              padding: "clamp(32px, 6vw, 64px)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: COLORS.accent,
                marginBottom: "16px",
              }}
            >
              03 — LET'S CONNECT
            </div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 600,
                margin: "0 0 16px 0",
              }}
            >
              Have a project in mind?
            </h2>
            <p style={{ color: COLORS.muted, fontSize: "16px", marginBottom: "32px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Open to freelance work in networking, security assessments, and small-scale programming projects.
            </p>
            <a
              href="mailto:mcdonaldbotchway18@gmail.com"
              className="btn"
              style={{
                display: "inline-block",
                background: COLORS.accent,
                color: "#0A0E14",
                padding: "16px 36px",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              mcdonaldbotchway18@gmail.com
            </a>
          </div>
        </Reveal>
        <div style={{ textAlign: "center", marginTop: "48px", color: COLORS.muted, fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}>
          © 2026 Donald Botchway — Built with React
        </div>
      </section>
    </div>
  );
}
