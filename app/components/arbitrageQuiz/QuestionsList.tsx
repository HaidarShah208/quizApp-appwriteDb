'use client'
import React, { useState, useEffect } from 'react';
import { Question } from '@/types/QuizType';
import { databaseService } from '@/app/appwrite/database.service';
import QuestionItem from './QuestionItem';
import LoadingSpinner from '../loader/LoadingSpinner';
import { QuestionsListProps } from '@/app/types/QuizType';

const QuestionsList: React.FC<QuestionsListProps> = ({ 
  quizId, 
  onAddQuestion,
  refreshTrigger = 0 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  const fetchQuestions = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      const fetchedQuestions = await databaseService.listQuizQuestions(quizId);
      
      // Convert the Appwrite document format to our Question format
      const formattedQuestions = fetchedQuestions.map((q: any) => {
        const answers = Array.isArray(q.answers) ? q.answers : [];
        
        return {
          id: q.$id,
          text: q.text || '',
          type: q.type || 'Yes/No',
          status: q.status || 'Unpublished',
          answers: answers,
          correctAnswer: q.correctAnswer || '',
          responseText: q.responseText || '',
          emoji: q.emoji || '',
        };
      });
      
      setQuestions(formattedQuestions);
      setError(null);
    } catch (err: any) {
      setError(`Error fetching questions: ${err.message}`);
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch questions when quizId or refreshTrigger changes
  useEffect(() => {
    fetchQuestions();
  }, [quizId, refreshTrigger]);

  const handleDeleteQuestion = async (questionId: string | number) => {
    try {
      // Implement actual question deletion using the database service
      await databaseService.deleteQuestion(String(questionId));
      
      // Remove from selected questions if it was selected
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
      
      // Update the questions list by filtering out the deleted question
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      
      // Also update the quiz question count
      await databaseService.updateQuizQuestionCount(quizId);
    } catch (err: any) {
      setError(`Error deleting question: ${err.message}`);
    }
  };

  const handleStatusChange = async (questionId: string | number, newStatus: 'Published' | 'Unpublished') => {
    try {
      // Implement question status update
      await databaseService.updateQuestionStatus(String(questionId), newStatus);
      
      // Update the local state to reflect the change
      setQuestions(prev => 
        prev.map(q => q.id === questionId ? {...q, status: newStatus} : q)
      );
    } catch (err: any) {
      setError(`Error updating question status: ${err.message}`);
    }
  };

  const handleUpdateQuestion = async (updatedQuestion: Question) => {
    try {
      setQuestions(prev => 
        prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
      );
    } catch (err: any) {
      setError(`Error updating question: ${err.message}`);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => String(q.id)));
    }
    setAllSelected(!allSelected);
  };

  const handleSelectQuestion = (questionId: string | number) => {
    const id = String(questionId);
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(prev => prev.filter(item => item !== id));
    } else {
      setSelectedQuestions(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) {
      try {
        setLoading(true);
        await Promise.all(selectedQuestions.map(id => databaseService.deleteQuestion(id)));
        
        setQuestions(prev => prev.filter(q => !selectedQuestions.includes(String(q.id))));
        setSelectedQuestions([]);
        setAllSelected(false);
        
        await databaseService.updateQuizQuestionCount(quizId);
      } catch (err: any) {
        setError(`Error deleting questions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedQuestions.length === 0) return;
    
    const newStatus = publish ? 'Published' : 'Unpublished';
    const actionText = publish ? 'publish' : 'unpublish';
    
    if (window.confirm(`Are you sure you want to ${actionText} ${selectedQuestions.length} questions?`)) {
      try {
        setLoading(true);
        await Promise.all(selectedQuestions.map(id => databaseService.updateQuestionStatus(id, newStatus)));
        
        setQuestions(prev => 
          prev.map(q => selectedQuestions.includes(String(q.id)) ? {...q, status: newStatus} : q)
        );
      } catch (err: any) {
        setError(`Error updating question status: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-black font-semibold">
          Questions ({questions.length})
        </h2>
        <div className="flex space-x-2">
     
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {selectedQuestions.length > 0 && (
        <div className="bg-gray-100 p-3 rounded mb-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">
              {selectedQuestions.length} questions selected
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkPublish(true)}
              className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
            >
              Unpublish Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {questions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#DC3414] text-white">
                <th className="p-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-3 text-center">#</th>
                <th className="p-3 text-left">Question</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Type</th>
                <th className="p-3 text-center">Answers</th>
                <th className="p-3 text-center">Update</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  onDelete={handleDeleteQuestion}
                  onStatusChange={handleStatusChange}
                  onUpdate={handleUpdateQuestion}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded">
          <h3 className="text-lg text-gray-600 font-medium">No questions found</h3>
        </div>
      )}
    </div>
  );
};

export default QuestionsList; 