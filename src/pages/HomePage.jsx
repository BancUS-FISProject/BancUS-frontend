import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="home">
      <section className="hero">
        <h1>BancUS</h1>
        <p>Tu banca universitaria simple, transparente y 100 % digital.</p>

        <div className="hero-actions">
          <Link to="/login" className="btn btn-primary">
            Acceder
          </Link>
          <Link to="/pricing" className="btn btn-secondary">
            Ver planes
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>¿Por qué BancUS?</h2>
        <div className="features-grid">
          <article>
            <h3>Sin comisiones raras</h3>
            <p>
              Condiciones claras para estudiantes y personal universitario,
              sin letra pequeña.
            </p>
          </article>
          <article>
            <h3>Tarjetas virtuales</h3>
            <p>
              Crea y elimina tarjetas en segundos para comprar con más
              seguridad en internet.
            </p>
          </article>
          <article>
            <h3>Enfoque académico</h3>
            <p>
              Todo el diseño de la app está pensado para proyectos universitarios
              y prácticas de desarrollo.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
