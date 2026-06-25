import { CheckCircle2, LockKeyhole } from "lucide-react";

const checklist = [
  "Tender details completed",
  "Budget and timeline confirmed",
  "Supplier requirements set",
  "Selection priorities assigned",
  "100 points allocated"
];

const lockedNotes = [
  "Suppliers will be assessed using these rules.",
  "The rules cannot be changed after submissions begin.",
  "Every award will be checked against these rules."
];

export function ReadyToLockPanel({
  onLock,
  onBack
}: {
  onLock: () => void;
  onBack: () => void;
}) {
  return (
    <aside className="h-fit bg-[#E7F5B8] p-6 xl:sticky xl:top-28">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Tender status</p>
      <h3 className="mt-4 text-5xl font-black leading-none tracking-[-0.075em] text-ofora-deep">Ready to lock</h3>
      <p className="mt-5 text-sm leading-6 text-ofora-ink/75">Your selection rules are complete and ready to apply to supplier submissions.</p>
      <div className="mt-6 space-y-3">
        {checklist.map((item) => (
          <div key={item} className="flex items-center gap-3 border-b border-ofora-deep/12 pb-3 text-sm font-black text-ofora-deep">
            <CheckCircle2 className="h-4 w-4 text-ofora-green" />
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-ofora-deep/15 pt-5">
        <p className="text-sm font-black text-ofora-deep">Once locked</p>
        <ul className="mt-3 space-y-3">
          {lockedNotes.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-ofora-ink/75">
              {index === 0 ? <LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-ofora-green" /> : <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-ofora-green" />}
              {item}
            </li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={onLock} className="ofora-focus mt-6 w-full rounded-lg bg-ofora-green px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-ofora-deep">
        Lock selection rules
      </button>
      <button type="button" onClick={onBack} className="ofora-focus mt-4 w-full text-sm font-black text-ofora-deep underline-offset-4 hover:underline">
        Back to edit
      </button>
    </aside>
  );
}
