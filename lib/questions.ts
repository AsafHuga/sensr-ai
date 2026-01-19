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
  {
    id: "11",
    category: "product_sense",
    question:
      "How would you build a platform for finding jobs?",
  },
  {
    id: "12",
    category: "product_sense",
    question:
      "How would you design an oven for people in wheelchairs?",
  },
  {
    id: "13",
    category: "product_sense",
    question:
      "Google Maps is launching a version for schools. How would you design it?",
  },
  {
    id: "14",
    category: "product_sense",
    question:
      "What is your favorite mobile app? Why? How would you improve it?",
  },
  {
    id: "15",
    category: "product_sense",
    question:
      "How would you design a neighborhood park?",
  },
  {
    id: "16",
    category: "product_sense",
    question:
      "What would you change in a supermarket to improve it for students?",
  },
  {
    id: "17",
    category: "product_sense",
    question:
      "What is your preferred photo storage website/app? What would you change about it?",
  },
  {
    id: "18",
    category: "product_sense",
    question:
      "Design a portal or an interactive landing page to replace Google.com.",
  },
  {
    id: "19",
    category: "product_sense",
    question:
      "How would you design a social networking / career website for entrepreneurs?",
  },
  {
    id: "20",
    category: "product_sense",
    question:
      "How would you integrate Stories into Instagram Explore?",
  },
  {
    id: "21",
    category: "product_sense",
    question:
      "How would you improve Facebook Groups?",
  },
  {
    id: "22",
    category: "product_sense",
    question:
      "How would you improve birthdays on Facebook?",
  },
  {
    id: "23",
    category: "product_sense",
    question:
      "You are a Product Manager at a grocery store. You are asked to redesign the store's display window—how would you design it?",
  },
  {
    id: "24",
    category: "product_sense",
    question:
      "How would you use Facebook to create a doctor referral program?",
  },
  {
    id: "25",
    category: "product_sense",
    question:
      "Build a product for buying and selling antiques.",
  },
  {
    id: "26",
    category: "product_sense",
    question:
      "Design a social travel product for Facebook.",
  },
];

export function getRandomQuestion(): Question {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
