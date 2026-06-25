const steps = [
  "Remove suppliers who do not meet the minimum requirements.",
  "Compare the remaining suppliers using your priorities.",
  "Validate the highest-scoring eligible supplier before an award can be confirmed."
];

export function DecisionProcessExplainer() {
  return (
    <section className="border-t border-ofora-border py-6">
      <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">How Ofora will make the decision</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="border border-ofora-border bg-ofora-canvas p-5">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Step {index + 1}</span>
            <p className="mt-4 text-sm leading-6 text-ofora-muted">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
