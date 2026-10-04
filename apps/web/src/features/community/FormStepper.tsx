import { useEffect, useRef, useState } from "react";
import { useLanguage, text } from "../../i18n";
export function useFormSteps(open: boolean) {
  const [step, setCurrentStep] = useState(0);
  const direction = useRef(1);
  const previousStep = useRef(0);
  function setStep(next: number) {
    direction.current = next < step ? -1 : 1;
    setCurrentStep(next);
  }
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const changed = previousStep.current !== step;
    previousStep.current = step;
    const form = formRef.current;
    if (!open || !form?.closest("dialog")?.open) return;
    form.closest("dialog")!.scrollTop = 0;
    const panel = form.querySelector<HTMLElement>(`[data-step="${step}"]`);
    panel
      ?.querySelector<HTMLElement>("[data-step-title]")
      ?.focus({ preventScroll: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (
      !changed ||
      reduced.matches ||
      document.hidden ||
      typeof panel?.animate !== "function"
    )
      return;
    const animation = panel.animate(
      [
        { transform: `translateX(${direction.current * 12}px)` },
        { transform: "translateX(0)" },
      ],
      { duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    const stopWhenReduced = () => {
      if (reduced.matches) animation.cancel();
    };
    const stopWhenHidden = () => {
      if (document.hidden) animation.cancel();
    };
    reduced.addEventListener("change", stopWhenReduced);
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      animation.cancel();
      reduced.removeEventListener("change", stopWhenReduced);
      document.removeEventListener("visibilitychange", stopWhenHidden);
    };
  }, [step, open]);
  function validStep() {
    const controls = formRef.current?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(
      `[data-step="${step}"] input, [data-step="${step}"] select, [data-step="${step}"] textarea`,
    );
    if (!controls) return false;
    for (const control of controls) {
      if (!control.disabled && !control.reportValidity()) return false;
    }
    return true;
  }
  return { step, setStep, formRef, validStep };
}
export default function FormStepper({
  step,
  onStep,
  labels,
  disabled = false,
}: {
  step: number;
  onStep: (step: number) => void;
  labels: string[];
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <nav
      className="community-stepper"
      aria-label={t(text("Các bước nhập thông tin", "Form steps"))}
    >
      <div className="community-step-line" aria-hidden="true">
        <span
          style={{
            transform: `scaleX(${labels.length > 1 ? step / (labels.length - 1) : 0})`,
          }}
        />
      </div>
      <ol>
        {labels.map((label, index) => (
          <li key={index} data-complete={index < step || undefined}>
            <button
              type="button"
              aria-current={index === step ? "step" : undefined}
              disabled={disabled || index > step}
              onClick={() => onStep(index)}
            >
              <span className="community-step-number" aria-hidden="true">
                {index < step ? "✓" : index + 1}
              </span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
