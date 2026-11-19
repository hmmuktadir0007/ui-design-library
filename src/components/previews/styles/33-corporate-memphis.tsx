import { useState } from "react";
import s from "./33-corporate-memphis.module.css";

const STEPS = [
  { title: "Welcome Aboard!", copy: "Collaborate seamlessly with high-energy workflows and expressive team toolkits designed for everyone.", prop: "★" },
  { title: "Invite your team", copy: "Bring teammates in with one link. Roles and permissions are set up for you.", prop: "✉" },
  { title: "Ship your first project", copy: "Pick a template, hit launch, and watch progress roll in on your dashboard.", prop: "✓" },
];

export default function CorporateMemphis() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const cur = STEPS[step];
  const last = step === STEPS.length - 1;
  const pct = done ? 100 : Math.round((step / STEPS.length) * 100);

  const next = () => (last ? setDone(true) : setStep((i) => i + 1));
  const back = () => {
    setDone(false);
    setStep((i) => Math.max(0, i - 1));
  };

  return (
    <div className={s.root}>
      <section className={s.card} aria-label="Onboarding">
        <div className={s.top}>
          <span className={s.badge}>STEP {String(step + 1).padStart(2, "0")} // ONBOARD</span>
          <span className={s.progressText} aria-live="polite">
            {done ? "All set!" : `Step ${step + 1} of ${STEPS.length}`}
          </span>
        </div>

        <div className={`${s.scene} ${step ? s[`scene${step}`] : ""}`} aria-hidden>
          <span className={`${s.blob} ${s.b1}`} />
          <span className={`${s.blob} ${s.b2}`} />
          <span className={`${s.squiggle} ${s.q1}`} />
          <span className={`${s.squiggle} ${s.q2}`} />
          <span className={s.star}>★</span>
          <span className={`${s.person} ${s.left}`}>
            <span className={s.head} />
          </span>
          <span className={`${s.person} ${s.right}`}>
            <span className={s.head} />
          </span>
          <span className={`${s.prop} ${done ? s.cheer : ""}`}>{done ? "🎉" : cur.prop}</span>
        </div>

        <h3 className={s.title}>{done ? "You're all set!" : cur.title}</h3>
        <p className={s.copy}>{done ? "Your workspace is ready. Jump back any time to revisit a step." : cur.copy}</p>

        <div className={s.track} role="progressbar" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </div>

        <div className={s.actions}>
          <button type="button" className={s.primary} onClick={done ? () => (setDone(false), setStep(0)) : next}>
            {done ? "Start over ↺" : step === 0 ? "Get Started →" : last ? "Finish ✓" : "Next →"}
          </button>
          <button type="button" className={s.secondary} onClick={back} aria-disabled={step === 0 && !done}>
            Back
          </button>
          <span className={s.avatars} aria-hidden>
            <span />
            <span />
          </span>
        </div>
      </section>
    </div>
  );
}
