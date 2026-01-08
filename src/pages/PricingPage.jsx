import { Link } from "react-router-dom";

function PricingPage() {
  const PLANS = [
    {
      id: "basico",
      name: "Plan Básico",
      price: "0 € / mes",
      description: "Para probar la banca online sin compromiso.",
      features: [
        "Cuenta de pruebas",
        "1 tarjeta virtual",
        "Hasta 5 transacciones al mes",
        "Notificaciones sobre las transacciones y los accesos en tiempo real",
        "Posibilidad de un pago programado configurado"
      ],
      highlight: false,
    },
    {
      id: "premium",
      name: "Plan Premium",
      price: "4,99 € / mes",
      description: "Uso habitual con varias tarjetas y más límites.",
      features: [
        "Hasta 5 tarjetas virtuales",
        "Notificaciones de transacciones, accesos y posibles fraudes en tiempo real",
        "Condiciones específicas para universitarios",
        "Hasta 10 pagos programados posibles"
      ],
      highlight: true,
    },
    {
      id: "pro",
      name: "Plan Pro",
      price: "9,99 € / mes",
      description: "Ideal para proyectos de desarrollo e integración con APIs.",
      features: [
        "Tarjetas virtuales ilimitadas",
        "Transacciones ilimitadas",
        "Notificaciones de transacciones, accesos, posibles fraudes e historial en tiempo real",
        "Acceso avanzado a la API",
        "Pagos programados ilimitados"
      ],
      highlight: false,
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
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              "pricing-card" +
              (plan.highlight ? " pricing-card--highlight" : "")
            }
          >
            {plan.highlight && (
              <span className="pricing-badge">Más popular</span>
            )}

            <h2>{plan.name}</h2>
            <p className="pricing-price">{plan.price}</p>
            <p className="pricing-description">{plan.description}</p>

            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <Link to="/#login" className="btn-primary pricing-cta">
              Empezar con este plan
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

export default PricingPage;
