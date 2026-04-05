export type Topic =
  | "Patient Care"
  | "Safety"
  | "Image Production"
  | "Procedures";

export type Choice = { id: "A" | "B" | "C" | "D"; text: string };

export type Question = {
  id: string;
  topic: Topic;
  prompt: string;
  choices: Choice[];
  answer: Choice["id"];
  shortExplanation: string;

  // Flashcard (optional, handcrafted cloze)
  flash_front?: string;
  flash_back?: string;
  flash_hint?: string;
};

export const BASELINE_50: Question[] = [
  {
    id: "q1",
    topic: "Safety",
    prompt: "Which factor most directly reduces patient dose?",
    choices: [
      { id: "A", text: "Increase mAs" },
      { id: "B", text: "Decrease mAs" },
      { id: "C", text: "Increase SID" },
      { id: "D", text: "Decrease kVp" }
    ],
    answer: "B",
    shortExplanation: "Lower mAs lowers the number of x-ray photons produced → lower dose."
  },
  {
    id: "q2",
    topic: "Image Production",
    prompt: "In digital radiography, increasing kVp generally does what to image receptor exposure?",
    choices: [
      { id: "A", text: "Decreases it" },
      { id: "B", text: "Increases it" },
      { id: "C", text: "No change" },
      { id: "D", text: "Only changes contrast" }
    ],
    answer: "B",
    shortExplanation: "Higher kVp increases beam penetration → more exposure at the receptor."
  },
  {
    id: "q3",
    topic: "Patient Care",
    prompt: "Before administering contrast, the MOST important step is to verify:",
    choices: [
      { id: "A", text: "The patient is NPO" },
      { id: "B", text: "The exam time" },
      { id: "C", text: "Allergy history" },
      { id: "D", text: "Room temperature" }
    ],
    answer: "C",
    shortExplanation: "A prior contrast reaction or allergy risk is a critical safety check."
  },
  {
    id: "q4",
    topic: "Procedures",
    prompt: "For a PA chest, the central ray is directed to the level of:",
    choices: [
      { id: "A", text: "C7" },
      { id: "B", text: "T3–T4" },
      { id: "C", text: "T7" },
      { id: "D", text: "L1" }
    ],
    answer: "C",
    shortExplanation: "PA chest is centered to T7 (inferior angle of scapula)."
  }
];

// Duplicate/expand to 20 with safe placeholders so the app runs.
for (let i = BASELINE_50.length + 1; i <= 50; i++) {
  BASELINE_50.push({
    id: `q${i}`,
    topic: (i % 4 === 0 ? "Procedures" : i % 4 === 1 ? "Safety" : i % 4 === 2 ? "Patient Care" : "Image Production"),
    prompt: `Sample ARRT-style baseline question #${i} (replace with your real content).`,
    choices: [
      { id: "A", text: "Choice A" },
      { id: "B", text: "Choice B" },
      { id: "C", text: "Choice C" },
      { id: "D", text: "Choice D" },
    ],
    answer: (i % 4 === 0 ? "D" : i % 4 === 1 ? "B" : i % 4 === 2 ? "C" : "A"),
    shortExplanation: "Replace this explanation with your real short explanation."
  });
}

