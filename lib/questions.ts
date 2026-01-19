export interface Question {
  id: string;
  category: "product_sense";
  question: string;
  context?: string;
}

export const questions: Question[] = [
  {
    id: "1",
    category: "product_sense",
    question:
      "How would you build a fitness app for seniors?",
  },
  {
    id: "2",
    category: "product_sense",
    question:
      "How would you build a carpooling feature for Google Maps?",
  },
  {
    id: "3",
    category: "product_sense",
    question:
      "How would you build a subscription service for Amazon?",
  },
  {
    id: "4",
    category: "product_sense",
    question:
      "How would you build a social feature for Spotify?",
  },
  {
    id: "5",
    category: "product_sense",
    question:
      "How would you build a learning platform for YouTube?",
  },
  {
    id: "6",
    category: "product_sense",
    question:
      "How would you build a marketplace for local services?",
  },
  {
    id: "7",
    category: "product_sense",
    question:
      "How would you build a budgeting feature for a banking app?",
  },
  {
    id: "8",
    category: "product_sense",
    question:
      "How would you build a remote collaboration tool for designers?",
  },
  {
    id: "9",
    category: "product_sense",
    question:
      "How would you build a meal planning app for busy parents?",
  },
  {
    id: "10",
    category: "product_sense",
    question:
      "How would you build a job matching feature for LinkedIn?",
  },
];

export function getRandomQuestion(): Question {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
