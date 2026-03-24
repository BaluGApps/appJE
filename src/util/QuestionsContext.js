import React, {createContext, useContext, useState} from 'react';
import {questions} from './Questions';

const QuestionsContext = createContext();

export const QuestionsProvider = ({children}) => {
  const [questionData, setQuestionData] = useState(questions);

  const value = {
    questionData,
    setQuestionData,
  };

  return (
    <QuestionsContext.Provider value={value}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
};
