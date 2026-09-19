import type { VisibleGoal } from "@/lib/scene-card";

export function SceneGoals({
  goals,
  focusLine = null,
}: {
  goals: VisibleGoal[];
  focusLine?: string | null;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <ul data-testid="scene-goals" className="flex flex-col gap-3">
        {goals.map((goal) => (
          <li key={goal.title} data-testid="scene-goal-item">
            <p className="text-sm font-semibold">{goal.title}</p>
            {goal.sentence ? (
              <p data-testid="scene-goal-why" className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                {goal.sentence}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {focusLine ? (
        <p data-testid="scene-goal-focus" className="text-muted-foreground text-sm leading-relaxed">
          {focusLine}
        </p>
      ) : null}
    </div>
  );
}
