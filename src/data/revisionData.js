import allQuestions from './questions';

const legacyRevisions = {
  bn: require('./revision/revision_bn.json'),
  gu: require('./revision/revision_gu.json'),
  pa: require('./revision/revision_pa.json'),
  ta: require('./revision/revision_ta.json'),
  te: require('./revision/revision_te.json'),
  mr: require('./revision/revision_mr.json'),
  or: require('./revision/revision_or.json'),
  as: require('./revision/revision_as.json'),
  mni: require('./revision/revision_mni.json'),
  ml: require('./revision/revision_ml.json'),
  gom: require('./revision/revision_gom.json'),
  ur: require('./revision/revision_ur.json'),
};

const normalizeAnswerIndex = value => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed > 0 ? parsed - 1 : parsed;
};

const buildRevisionFromPractice = language => {
  const questionBank = allQuestions[language] || allQuestions.en || {};

  return Object.entries(questionBank).flatMap(([category, questions]) => {
    if (!Array.isArray(questions)) {
      return [];
    }

    return questions.map((question, index) => {
      const answerIndex = normalizeAnswerIndex(question.ans);
      const answerText = Array.isArray(question.options)
        ? question.options[answerIndex] || ''
        : '';

      return {
        id: `${category}-${question.id || index + 1}`,
        q: question.q,
        a: answerText,
        category,
      };
    });
  });
};

const revisions = {
  en: buildRevisionFromPractice('en'),
  hi: buildRevisionFromPractice('hi'),
  kn: buildRevisionFromPractice('kn'),
  ...legacyRevisions,
};

export default revisions;
