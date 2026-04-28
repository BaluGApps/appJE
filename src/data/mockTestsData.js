import allQuestions from './questions';

const QUESTIONS_PER_TEST = 25;
const TEST_DURATION_SECONDS = 20 * 60;

const CATEGORY_META = {
  NTPC: {accent: '#F97316'},
  ALP: {accent: '#0891B2'},
  JE: {accent: '#16A34A'},
  GroupD: {accent: '#7C3AED'},
};

const getQuestionBank = language => allQuestions[language] || allQuestions.en || {};

const normalizeAnswerIndex = value => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed > 0 ? parsed - 1 : parsed;
};

const normalizeQuestion = (question, category, testNumber, index) => ({
  id: `${category}-${testNumber}-${question.id || index + 1}`,
  q: question.q,
  options: Array.isArray(question.options) ? question.options : [],
  ans: normalizeAnswerIndex(question.ans),
  explanation: question.explanation || question.solution || '',
});

export const buildMockCatalog = language => {
  const bank = getQuestionBank(language);

  return Object.entries(bank).flatMap(([category, questions]) => {
    if (!Array.isArray(questions) || questions.length < QUESTIONS_PER_TEST) {
      return [];
    }

    const testCount = Math.floor(questions.length / QUESTIONS_PER_TEST);

    return Array.from({length: testCount}, (_, index) => {
      const start = index * QUESTIONS_PER_TEST;
      const slice = questions
        .slice(start, start + QUESTIONS_PER_TEST)
        .map((question, questionIndex) =>
          normalizeQuestion(question, category, index + 1, questionIndex),
        );

      return {
        id: `${category.toLowerCase()}-${index + 1}`,
        category,
        title: `RRB ${category} Mock ${index + 1}`,
        questionCount: slice.length,
        durationSeconds: TEST_DURATION_SECONDS,
        accent: CATEGORY_META[category]?.accent || '#0074E4',
        questions: slice,
      };
    });
  });
};

export const getMockTestById = (language, testId) =>
  buildMockCatalog(language).find(test => test.id === testId) || null;

export const getMockSummary = language => {
  const tests = buildMockCatalog(language);

  return tests.reduce((summary, test) => {
    const current = summary[test.category] || {count: 0, questions: 0};
    summary[test.category] = {
      count: current.count + 1,
      questions: current.questions + test.questionCount,
    };
    return summary;
  }, {});
};

export default {
  buildMockCatalog,
  getMockTestById,
  getMockSummary,
  QUESTIONS_PER_TEST,
  TEST_DURATION_SECONDS,
};
