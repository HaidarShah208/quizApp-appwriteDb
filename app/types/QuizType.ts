export interface Question {
  id: number | string;
  text: string;
  type: string;
  status: string;
  answers: string[];
  responseText: string;
  correctAnswer?: string;
  emoji?: string;
  imageCiteSource?: string;
}
export interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
  }
  export interface QuestionsListProps {
    quizId: string;
    onAddQuestion?: () => void;
    refreshTrigger?: number;
  }
  
export interface QuizType {
  $id: string; 
  id?: number;
  quizName: string;
  quizTitle?: string;
  selectedColor?: string;
  basePoints?: number | string;
  pointsPerSecond?: number | string;
  timePerQuestion?: number | string;
  aboutTitle?: string;
  aboutParagraph?: string;
  status?: string;
  template?: string;
  duplicate?: number | string;
  publishedDate?: string;
  tags?: string[];
  questions: string;
  [key: string]: any;  
}

export interface CreateQuizFormProps {
  onCancel: () => void;
  onCreateQuiz: (quiz: any) => void;
}

export interface QuizDetailsProps {
  quiz: QuizType;
  onBack: () => void;
} 

export interface QuestionItemProps {
  question: Question;
  index: number;
  onUpdate?: (question: Question) => void;
  onDelete?: (questionId: string | number) => void;
  onStatusChange?: (questionId: string | number, newStatus: 'Published' | 'Unpublished') => void;
}