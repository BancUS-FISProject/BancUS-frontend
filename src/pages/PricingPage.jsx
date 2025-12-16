import { Link } from "react-router-dom";

function PricingPage() {
  const plans = [
    {
      id: "basic",
      name: "Plan Básico",
      price: "0 € / mes",
      description: "Para empezar a probar BancUS sin compromiso.",
      features: [
        "Cuenta básica de pruebas",
        "1 tarjeta virtual",
        "Límites reducidos de operación",
      ],
      recommended: false,
    },
    {
      id: "student",
      name: "Plan Estudiante",
      price: "4,99 € / mes",
      description: "Pensado para uso habitual en el día a día.",
      features: [
        "Hasta 5 tarjetas virtuales",
        "Notificaciones instantáneas",
        "Soporte prioritario dentro del campus",
      ],
      recommended: true,
    },
    {
      id: "pro",
      name: "Plan Pro",
      price: "9,99 € / mes",
      description: "Ideal para proyectos de investigación y desarrollo.",
      features: [
        "Tarjetas ilimitadas",
        "Límites de operación ampliados",
        "Acceso a API ampliada para integraciones",
      ],
      recommended: false,
    },
  ];

  return (
    <main className="pricing">
      <header className="pricing-header">
        <h1>Planes y precios</h1>
        <p>
          Escoge el plan que mejor se adapte a tu uso académico o de desarrollo.
        </p>
      </header>

      <section className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`pricing-card ${
              plan.recommended ? "pricing-card--highlight" : ""
            }`}
          >
            {plan.recommended && (
              <span className="badge">Recomendado</span>
            )}

            <h2>{plan.name}</h2>
            <p className="pricing-price">{plan.price}</p>
            <p className="pricing-description">{plan.description}</p>

            <ul className="pricing-features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <Link to="/login" className="btn btn-primary">
              Empezar con este plan
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

export default PricingPage;
