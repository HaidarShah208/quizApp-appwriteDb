export type CreateQuizFormProps = {
    onCancel: () => void;
    onCreateQuiz: (quizData: any) => void;
}

export type Question = {
    id: number;
    text: string;
    type: string;
    status: string;
    emoji?: string;
    answers?: string[];
    responseText?: string;
    imageCiteSource?: string;
    imageSize?: string;
  }
  
  export type QuizDetailsProps = {
    quiz: {
      id: number;
      quizName: string;
      questions: string;
    };
    onBack: () => void;
  }