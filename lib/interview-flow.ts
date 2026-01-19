export type FrameworkStep =
  | "intro"
  | "goal"
  | "segments"
  | "pain_points"
  | "solutions"
  | "metrics"
  | "mvp"
  | "complete";

export interface StepConfig {
  id: FrameworkStep;
  title: string;
  shortTitle: string;
  prompt: string;
  followUpPrompts: string[];
  tips: string[];
  exampleResponse?: string;
}

export const frameworkSteps: Record<FrameworkStep, StepConfig> = {
  intro: {
    id: "intro",
    title: "Welcome",
    shortTitle: "Start",
    prompt: "Welcome! I'll guide you through answering this product question using a proven framework. We'll cover: Goal, User Segments, Pain Points, Solutions, Metrics, and MVP. Ready to begin?",
    followUpPrompts: [],
    tips: ["Take a breath", "Think out loud", "It's okay to pause"],
  },
  goal: {
    id: "goal",
    title: "Clarify the Goal",
    shortTitle: "Goal",
    prompt: "Let's start by clarifying the goal. What problem are we trying to solve? What's the business objective or user outcome we're aiming for?",
    followUpPrompts: [
      "Can you be more specific about the primary objective?",
      "Is this about user growth, engagement, revenue, or something else?",
      "What would success look like at a high level?",
    ],
    tips: [
      "State assumptions clearly",
      "Pick ONE primary goal to focus on",
      "Consider both user and business goals",
    ],
    exampleResponse: "I'd like to focus on improving user retention for this product. The goal is to increase the percentage of users who return within 7 days, as this is a strong indicator of product-market fit.",
  },
  segments: {
    id: "segments",
    title: "Define User Segments",
    shortTitle: "Segments",
    prompt: "Great! Now, who are your target users? Identify the key user segments you're focusing on. What are their characteristics, behaviors, and context?",
    followUpPrompts: [
      "Can you identify 2-3 distinct user segments?",
      "Which segment is your primary focus and why?",
      "How do these segments differ in their needs?",
    ],
    tips: [
      "Identify 2-3 key segments",
      "Prioritize one as your primary focus",
      "Consider demographics AND behaviors",
    ],
    exampleResponse: "I see three key segments: 1) Power users who use daily and want efficiency, 2) Casual users who engage weekly and need simplicity, 3) New users who need onboarding. I'll focus primarily on power users as they drive retention.",
  },
  pain_points: {
    id: "pain_points",
    title: "Identify Pain Points",
    shortTitle: "Pain Points",
    prompt: "Excellent. What are the key pain points or unmet needs for these user segments? What frustrations or challenges do they face?",
    followUpPrompts: [
      "Why is this pain point significant?",
      "How are users currently working around this problem?",
      "Which pain point is most critical to address first?",
    ],
    tips: [
      "List 2-3 pain points, then prioritize",
      "Connect pain points to user behavior",
      "Consider emotional and functional needs",
    ],
    exampleResponse: "The main pain points are: 1) Too many steps to complete core tasks, 2) No way to save progress and resume later, 3) Notifications are generic and not personalized to their needs.",
  },
  solutions: {
    id: "solutions",
    title: "Propose Solutions",
    shortTitle: "Solutions",
    prompt: "Now let's brainstorm solutions. What features or changes would address these pain points? Think creatively but stay grounded. Give me multiple solution ideas.",
    followUpPrompts: [
      "Can you think of 2-3 different approaches?",
      "How would each solution address the pain points you mentioned?",
      "What are the trade-offs between these solutions?",
    ],
    tips: [
      "Propose 2-3 solution ideas",
      "Consider effort vs. impact for each",
      "Think about technical feasibility",
    ],
    exampleResponse: "Three potential solutions: 1) Quick Action widget - surfaces common tasks on home screen, 2) Smart Resume - auto-saves progress and reminds users, 3) Personalized notifications based on usage patterns.",
  },
  metrics: {
    id: "metrics",
    title: "Define Success Metrics",
    shortTitle: "Metrics",
    prompt: "How would you measure success? What metrics would you track, and what targets would indicate the solutions are working?",
    followUpPrompts: [
      "What would be your north star metric?",
      "How would you distinguish correlation from causation?",
      "What guardrail metrics would you watch?",
    ],
    tips: [
      "Include leading AND lagging indicators",
      "Set specific targets, not just 'increase X'",
      "Consider counter-metrics to avoid",
    ],
    exampleResponse: "Primary metric: 7-day retention rate, target +5%. Secondary: Task completion time, target -30%. Guardrail: Ensure feature discovery doesn't decrease for new users.",
  },
  mvp: {
    id: "mvp",
    title: "Define the MVP",
    shortTitle: "MVP",
    prompt: "Finally, what would the MVP look like? What's the smallest version you could ship to validate your hypothesis and start learning?",
    followUpPrompts: [
      "What features would you cut to ship faster?",
      "How would you test this with real users?",
      "What's your timeline for the MVP?",
    ],
    tips: [
      "Focus on the core value proposition",
      "Cut scope ruthlessly",
      "Think about what you need to learn, not build",
      "Define clear success criteria for the MVP",
    ],
    exampleResponse: "MVP would be the Quick Action widget with just the top 3 most-used actions, hard-coded initially. We'd A/B test with 10% of power users for 2 weeks. Success = 15% increase in daily task completion. If validated, we'd add ML personalization in v2.",
  },
  complete: {
    id: "complete",
    title: "Great Job!",
    shortTitle: "Done",
    prompt: "Excellent work! You've completed the framework beautifully. Your structured response covers Goal, Segments, Pain Points, Solutions, Metrics, and MVP. Ready to submit for evaluation?",
    followUpPrompts: [],
    tips: [],
  },
};

export const stepOrder: FrameworkStep[] = [
  "intro",
  "goal",
  "segments",
  "pain_points",
  "solutions",
  "metrics",
  "mvp",
  "complete",
];

export function getNextStep(current: FrameworkStep): FrameworkStep {
  const currentIndex = stepOrder.indexOf(current);
  if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
    return "complete";
  }
  return stepOrder[currentIndex + 1];
}

export function getStepProgress(current: FrameworkStep): number {
  const currentIndex = stepOrder.indexOf(current);
  return Math.round((currentIndex / (stepOrder.length - 1)) * 100);
}
