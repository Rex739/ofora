type Priority = {
  id: string;
  title: string;
  description: string;
  points: number;
};

const plainCopies: Record<string, string> = {
  price: "Better value for money",
  delivery: "Faster delivery within the required timeframe",
  stock: "More items ready to supply",
  quality: "Higher quality and compliance capability",
  local: "Greater support for local jobs, suppliers, or supply chains"
};

export function ScoringPrioritiesSummary({ priorities, onEdit }: { priorities: Priority[]; onEdit: () => void }) {
  return (
    <section className="border-t border-ofora-border py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">How suppliers will be compared</h3>
          <p className="mt-2 text-sm leading-6 text-ofora-muted">Ofora will compare eligible suppliers using the priorities you selected.</p>
        </div>
        <button type="button" onClick={onEdit} className="ofora-focus text-sm font-black text-ofora-green underline-offset-4 hover:underline">
          Edit priorities
        </button>
      </div>
      <ol className="mt-5 grid gap-0">
        {priorities.map((priority, index) => (
          <li key={priority.id} className="grid grid-cols-[2.25rem_1fr_auto] gap-4 border-b border-ofora-border py-4">
            <span className="text-2xl font-black text-ofora-deep">{index + 1}</span>
            <div>
              <p className="font-black text-ofora-deep">{priority.title}</p>
              <p className="mt-1 text-sm text-ofora-muted">{plainCopies[priority.id]}</p>
            </div>
            <span className="self-center text-sm font-black text-ofora-green">{priority.points} points</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
