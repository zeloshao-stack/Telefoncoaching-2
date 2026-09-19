import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCENARIO_BLURBS } from "../content/pack";
import { drillHonesty } from "../scenario-product";
import { sceneIntel } from "../scene-intel";
import {
  catalogSessionBody,
  catalogSurface,
  homeStartAction,
  initialsFromName,
  toSceneCard,
  visibleGoalsFromBeats,
} from "../scene-card";

test("S01-Karte: Titel, Telefonat, drei Why-Ziele, Initialen, Chip — keine Win-Rate, kein Foto", () => {
  const intel = sceneIntel("S01");
  assert.ok(intel);
  const card = toSceneCard({
    id: "S01",
    title: "Honorarvergleich",
    counterpart: "Elisabeth Leitner · Zinshaus, Wien",
    blurb: SCENARIO_BLURBS.S01,
    verticalId: "immobilien",
  });
  assert.ok(card);
  assert.equal(card.title, "Honorarvergleich");
  assert.equal(card.channelLabel, "Telefonat");
  assert.equal(card.name, "Elisabeth Leitner");
  assert.equal(card.initials, "EL");
  assert.equal(card.roleChip, "Zinshaus, Wien");
  assert.equal(card.goals.length, 3);
  assert.equal(card.focusLine, null);
  for (const [index, goal] of card.goals.entries()) {
    const beat: { title: string; why: string } | undefined = intel.beats[index];
    assert.ok(beat);
    assert.equal(goal.title, beat.title);
    assert.equal(goal.sentence, beat.why);
    assert.ok(goal.title.length > 0);
    assert.ok(goal.title.length < 80);
    assert.doesNotMatch(goal.title, /70\s*\/\s*30/);
  }
  const surface = catalogSurface(card);
  assert.deepEqual(Object.keys(surface).sort(), [
    "channelLabel",
    "focusLine",
    "goals",
    "initials",
    "name",
    "roleChip",
    "title",
  ]);
  assert.equal(surface.focusLine, null);
  assert.equal("winRate" in surface, false);
  assert.equal("qualifyPoints" in surface, false);
  assert.equal("evalBeats" in surface, false);
  assert.equal("imageUrl" in card, false);
  assert.equal("photo" in card, false);
  assert.doesNotMatch(JSON.stringify(surface), /Kein Drängen|Upgrade|Pro-Feature|Schloss/);
});

test("ohne Intel: drei Titel plus practiceFocus, kein erfundenes Why", () => {
  const honesty = drillHonesty("A01", true);
  const card = toSceneCard({
    id: "A01",
    title: "Entwurf",
    counterpart: "Max Muster · Lage",
    verticalId: "immobilien",
    draft: true,
  });
  assert.ok(card);
  assert.equal(sceneIntel("A01"), null);
  assert.equal(card.goals.length, 3);
  assert.ok(card.goals.every((goal) => goal.sentence === ""));
  assert.equal(card.focusLine, honesty.practiceFocus);
  assert.ok(card.beats.every((beat) => beat.why === ""));
});

test("visibleGoalsFromBeats erfindet keinen Satz", () => {
  const emptyWhy = visibleGoalsFromBeats(
    [{ title: "Umfang zuerst", why: "" }, { title: "Unterschied prüfen" }, { title: "Zahl bleibt zu", why: "   " }],
    "Leistungsumfang klären, bevor Sie den Preis verteidigen.",
  );
  assert.equal(emptyWhy.focusLine, "Leistungsumfang klären, bevor Sie den Preis verteidigen.");
  assert.ok(emptyWhy.goals.every((goal) => goal.sentence === ""));

  const authored = visibleGoalsFromBeats(
    [{ title: "Umfang zuerst", why: "Vor einer Preisbewegung den Umfang klären." }],
    "Leistungsumfang klären, bevor Sie den Preis verteidigen.",
  );
  assert.equal(authored.focusLine, null);
  assert.equal(authored.goals[0]?.sentence, "Vor einer Preisbewegung den Umfang klären.");
});

test("Session-POST trägt nur scenarioId und focusId", () => {
  const body = catalogSessionBody("S01", "diagnosis");
  assert.deepEqual(body, { scenarioId: "S01", focusId: "diagnosis" });
  assert.deepEqual(Object.keys(body).sort(), ["focusId", "scenarioId"]);
});

test("Frozen-Stapel startet, eigene Fälle bleiben Briefing", () => {
  assert.equal(homeStartAction("featured"), "start");
  assert.equal(homeStartAction("rest"), "start");
  assert.equal(homeStartAction("own"), "briefing");
});

test("Cold-Karte: Why sichtbar, Härte nicht als Score", () => {
  const honesty = drillHonesty("S02");
  const intel = sceneIntel("S02");
  assert.ok(intel);
  const card = toSceneCard({
    id: "S02",
    title: "Klare Kontaktablehnung",
    counterpart: "Franz Berger · klare Absage",
    blurb: SCENARIO_BLURBS.S02,
    verticalId: "immobilien",
  });
  assert.ok(card);
  assert.equal(card.cold, true);
  assert.equal(card.goals[0]?.title, intel.beats[0]?.title);
  assert.equal(card.goals[0]?.sentence, intel.beats[0]?.why);
  assert.match(honesty.callLabel, /Kalt/i);
  assert.equal(initialsFromName("Franz Berger"), "FB");
  assert.doesNotMatch(JSON.stringify(catalogSurface(card)), /Upgrade|Pro-Feature|Schloss/i);
});

test("SceneCard hat keinen Was-zählt-Klapp und rendert Textknoten", () => {
  const cardSource = readFileSync(new URL("../../components/training/SceneCard.tsx", import.meta.url), "utf8");
  const goalsSource = readFileSync(new URL("../../components/training/SceneGoals.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(cardSource, /Was zählt|countsOpen|dangerouslySetInnerHTML/);
  assert.doesNotMatch(goalsSource, /Was zählt|dangerouslySetInnerHTML/);
  assert.match(goalsSource, /data-testid="scene-goal-item"/);
  assert.match(goalsSource, /\{goal\.title\}/);
  assert.match(goalsSource, /\{goal\.sentence\}/);
});
