import { useState } from "react";
import s from "./32-flat-2.module.css";

const PLANS = [
  { name: "Starter", monthly: 19, annual: 15, features: ["3 workspaces", "Daily analytics sync", "Email alerts"] },
  { name: "Pro", monthly: 59, annual: 49, features: ["Unlimited workspaces & seats", "Real-time analytics engine", "Automated webhook alerts"] },
  { name: "Team", monthly: 99, annual: 79, features: ["Everything in Pro", "SSO & audit log", "Priority support"] },
];
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function Flat2() {
  const [annual, setAnnual] = useState(true);
  const [plan, setPlan] = useState(1);
  const [seats, setSeats] = useState(3);
  const [confirmed, setConfirmed] = useState(false);
  const p = PLANS[plan];
  const unit = annual ? p.annual : p.monthly;
  const months = annual ? 12 : 1;
  const subtotal = p.monthly * seats * months;
  const total = unit * seats * months;

  return (
    <div className={s.root}>
      <header className={s.bar}>
        <span className={s.brand}>
          <span className={s.logo} aria-hidden />
          SaaSMetrics OS
        </span>
        <div className={s.billing} role="radiogroup" aria-label="Billing period">
          {[false, true].map((a) => (
            <button key={String(a)} type="button" role="radio" aria-checked={annual === a} className={s.billBtn} onClick={() => setAnnual(a)} disabled={confirmed}>
              {a ? "Annual −17%" : "Monthly"}
            </button>
          ))}
        </div>
      </header>

      <div className={s.body}>
        <section className={s.card} aria-label="Plan">
          <div className={s.plans} role="radiogroup" aria-label="Plan tier">
            {PLANS.map((x, i) => (
              <button key={x.name} type="button" role="radio" aria-checked={i === plan} className={s.planBtn} onClick={() => setPlan(i)} disabled={confirmed}>
                {x.name}
              </button>
            ))}
          </div>
          <p className={s.price}>
            {usd(unit)} <span className={s.per}>/ seat / month</span>
          </p>
          <p className={s.note}>{annual ? `Billed annually, or ${usd(p.monthly)} billed monthly` : `Billed monthly, or ${usd(p.annual)} billed annually`}</p>
          <ul className={s.features}>
            {p.features.map((f) => (
              <li key={f}>
                <span className={s.tick} aria-hidden>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className={s.seats}>
            <span className={s.seatLabel} aria-hidden>
              SEATS
            </span>
            <button type="button" className={s.step} aria-label="Remove seat" onClick={() => setSeats((n) => Math.max(1, n - 1))} disabled={confirmed}>
              −
            </button>
            <output className={s.seatNum} aria-live="polite" aria-label={`${seats} seats`}>
              {seats}
            </output>
            <button type="button" className={s.step} aria-label="Add seat" onClick={() => setSeats((n) => Math.min(50, n + 1))} disabled={confirmed}>
              +
            </button>
          </div>
        </section>

        <section className={s.card} aria-label="Order summary">
          {confirmed ? (
            <div className={s.done} role="status">
              <span className={s.check} aria-hidden>
                ✓
              </span>
              <p className={s.doneTitle}>You're on {p.name}</p>
              <p className={s.note}>
                {seats} seats · {usd(total)} {annual ? "per year" : "per month"}
              </p>
              <p className={s.demo}>Demo only — no payment was taken.</p>
              <button type="button" className={s.secondary} onClick={() => setConfirmed(false)}>
                Change plan
              </button>
            </div>
          ) : (
            <>
              <p className={s.kicker}>ORDER SUMMARY</p>
              <dl className={s.lines}>
                <dt>
                  {p.name} × {seats} seats
                </dt>
                <dd>{usd(subtotal)}</dd>
                <dt>Annual discount</dt>
                <dd className={s.save}>{annual ? `−${usd(subtotal - total)}` : usd(0)}</dd>
                <dt className={s.totalLabel}>Total {annual ? "per year" : "per month"}</dt>
                <dd className={s.total}>{usd(total)}</dd>
              </dl>
              <button type="button" className={s.cta} onClick={() => setConfirmed(true)}>
                Upgrade Plan →
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
