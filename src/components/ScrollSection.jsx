import React, { useEffect, useRef, useState } from "react";

//Para revelar al hacer scroll
function ScrollSection({ id, title, subtitle, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`scroll-section ${visible ? "is-visible" : ""}`}
    >
      {title && (
        <header className="scroll-section-header">
          <h2>{title}</h2>
          {subtitle && <p className="scroll-section-subtitle">{subtitle}</p>}
        </header>
      )}
      <div className="scroll-section-body">{children}</div>
    </section>
  );
}

export default ScrollSection;
