'use client'
import { Question } from '@/types/QuizType';
import { QuizDetailsProps } from '@/types/QuizType';
import React, { useState, useEffect } from 'react';
import { databaseService } from '@/app/appwrite/database.service';
import LoadingSpinner from '../loader/LoadingSpinner';
import QuestionsList from './QuestionsList';
import Swal from 'sweetalert2';

interface AppwriteDocument {
  $id: string;
  [key: string]: any;
}

export default function QuizDetails({ quiz, onBack }: QuizDetailsProps) {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: 1,
    text: '',
    type: 'Yes/No',
    status: 'Unpublished',
    answers: [],
    responseText: '',
  });
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [yesOption, setYesOption] = useState('');
  const [noOption, setNoOption] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'Yes' | 'No' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const quizId = (quiz as any)?.$id || String(quiz.id || '');

  const refreshQuestions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBulkStatusChange = async (status: 'Published' | 'Unpublished') => {
    try {
      setIsBulkUpdating(true);
      
      // Get all questions for the quiz
      const allQuestions = await databaseService.listQuizQuestions(quizId);
      
      // Update each question's status
      await Promise.all(
        allQuestions.map((question: any) => 
          databaseService.updateQuestionStatus(question.$id, status)
        )
      );
      
      // Refresh the questions list
      refreshQuestions();
      
      setError(null);
      
      // Show success toast notification
      Swal.fire({
        title: `Questions ${status === 'Published' ? 'Published' : 'Unpublished'}!`,
        text: `All questions have been ${status === 'Published' ? 'published' : 'unpublished'} successfully`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err: any) {
      setError(`Failed to ${status === 'Published' ? 'publish' : 'unpublish'} all questions: ${err.message}`);
      
      // Show error toast
      Swal.fire({
        title: 'Error!',
        text: `Failed to ${status === 'Published' ? 'publish' : 'unpublish'} all questions: ${err.message}`,
        icon: 'error',
        toast: true, 
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) {
      setError('Question text is required');
      return;
    }

    try {
      setSaving(true);
      
      let answers: string[] = [];
      let correctAnswerValue = '';
      
      if (newQuestion.type === 'Multiple Choice') {
        answers = options.filter(opt => opt.trim() !== '');
        
        if (correctOption !== null && correctOption < answers.length) {
          correctAnswerValue = answers[correctOption];
        }
        
        if (answers.length < 2) {
          setError('At least 2 options are required for Multiple Choice questions');
          setSaving(false);
          return;
        }
        
        if (correctAnswerValue === '') {
          setError('Please select a correct answer');
          setSaving(false);
          return;
        }
      } else {
        if (!yesOption.trim() || !noOption.trim()) {
          setError('Both Yes and No options are required');
          setSaving(false);
          return;
        }
        
        answers = [yesOption, noOption];
        
        if (!correctAnswer) {
          setError('Please select the correct answer (Yes or No)');
          setSaving(false);
          return;
        }
        
        correctAnswerValue = correctAnswer === 'Yes' ? yesOption : noOption;
      }
      
      const questionToSave = {
        ...newQuestion,
        answers,
        correctAnswer: correctAnswerValue
      };
      
      await databaseService.createQuestion(questionToSave, quizId);
      
      setNewQuestion({
        id: 1,
        text: '',
        type: 'Yes/No',
        status: 'Unpublished',
        answers: [],
        responseText: '',
      });
      setOptions(['', '', '', '']);
      setCorrectOption(null);
      setYesOption('');
      setNoOption('');
      setCorrectAnswer(null);
      setShowAddQuestion(false);
      setError(null);
      
      refreshQuestions();
      
      // Show success toast notification
      Swal.fire({
        title: 'Question Added!',
        text: 'Your question has been added successfully',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err: any) {
      setError(`Failed to add question: ${err.message}`);
      console.error('Error adding question:', err);
      
      // Show error toast
      Swal.fire({
        title: 'Error!',
        text: `Failed to add question: ${err.message}`,
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    if (correctOption === index) {
      setCorrectOption(null);
    } else if (correctOption !== null && correctOption > index) {
      setCorrectOption(correctOption - 1);
    }
  };

  const renderQuestionForm = () => (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="bg-[#DC3414] text-white p-4 text-xl font-semibold -mx-6 -mt-6 rounded-t-lg mb-6">
        Add Question For {quiz.quizName}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Question ( Max Characters 80)</label>
          <input
            type="text"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            placeholder="Enter Question !"
            className="w-full text-black border rounded-lg px-4 py-2"
            maxLength={80}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Choose Emoji</label>
          <div className="inline-flex gap-2 bg-white rounded-full border px-4 py-2">
            {['👍', '❤️', '😃', '😮', '🙏', '👎', '😡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewQuestion({ ...newQuestion, emoji })}
                className={`text-2xl hover:scale-110 transition-transform ${newQuestion.emoji === emoji ? 'ring-2 ring-blue-500 rounded-full' : ''}`}
              >
                {emoji}
              </button>
            ))}
            <button className="text-2xl text-black">+</button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Question Type</label>
          <select
            value={newQuestion.type}
            onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
            className="w-full text-black border rounded-lg px-4 py-2"
          >
            <option>Yes/No</option>
            <option>Multiple Choice</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            value={newQuestion.status}
            onChange={(e) => setNewQuestion({ ...newQuestion, status: e.target.value })}
            className="w-full text-black border rounded-lg px-4 py-2"
          >
            <option value="Published">Published</option>
            <option value="Unpublished">Unpublished</option>
          </select>
        </div>

        {newQuestion.type === 'Multiple Choice' ? (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Multiple Choice Options</h3>
            <p className="text-sm text-gray-500 mb-3">* Max Characters 30</p>
            
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-grow text-black border rounded-lg px-4 py-2"
                  maxLength={30}
                />
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOption === index}
                    onChange={() => setCorrectOption(index)}
                    className="w-4 h-4 mr-1"
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 px-2 py-1"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                      <rect x="5" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 9v4M12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {options.length < 8 && (
              <button
                onClick={handleAddOption}
                className="flex items-center text-blue-600 hover:underline mt-2"
              >
                <span className="text-xl mr-1">+</span> Add Option
              </button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Yes/No Options</h3>
            
            <div className="mb-3">
              <label className="block text-gray-600 mb-1">Option Yes</label>
              <input
                type="text"
                value={yesOption}
                onChange={(e) => setYesOption(e.target.value)}
                placeholder="Enter Option Yes"
                className="w-full text-black border rounded-lg px-4 py-2"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-600 mb-1">Option No</label>
              <input
                type="text"
                value={noOption}
                onChange={(e) => setNoOption(e.target.value)}
                placeholder="Enter Option No"
                className="w-full text-black border rounded-lg px-4 py-2"
              />
            </div>
            
            <div className="mt-3">
              <label className="block text-gray-700 mb-2">Select Answer:</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex text-black items-center">
                  <input
                    type="radio"
                    name="yesNoAnswer"
                    checked={correctAnswer === 'Yes'}
                    onChange={() => setCorrectAnswer('Yes')}
                    className="w-4 h-4 mr-2"
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex text-black items-center">
                  <input
                    type="radio"
                    name="yesNoAnswer"
                    checked={correctAnswer === 'No'}
                    onChange={() => setCorrectAnswer('No')}
                    className="w-4 h-4 mr-2"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-2">Response Text</label>
          <textarea
            value={newQuestion.responseText}
            onChange={(e) => setNewQuestion({ ...newQuestion, responseText: e.target.value })}
            placeholder="Enter a paragraph explaining the correct answer"
            className="w-full text-black border rounded-lg px-4 py-2 h-32"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Upload Image Manual</label>
          <div className="flex items-center gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Upload Image
            </button>
            <span className="text-gray-600">Please only upload images in ratio aspect 16:9</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          {saving ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="small" />
              <span>Saving...</span>
            </div>
          ) : (
            <button
              onClick={handleAddQuestion}
              className="bg-[#DC3414] text-white px-6 py-2 rounded"
            >
              Add Question
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-2xl text-black font-bold">{quiz.quizName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddQuestion(true)}
            className="bg-[#DC3414] text-white px-4 py-2 rounded"
          >
            Add Question
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Upload CSV
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => handleBulkStatusChange('Published')}
          disabled={isBulkUpdating}
          className={`bg-teal-500 text-white px-4 py-2 rounded flex items-center ${isBulkUpdating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-600'}`}
        >
          {isBulkUpdating ? <><LoadingSpinner size="small" /><span className="ml-2">Processing...</span></> : 'Publish All'}
        </button>
        <button
          onClick={() => handleBulkStatusChange('Unpublished')}
          disabled={isBulkUpdating}
          className={`bg-[#DC3414] text-white px-4 py-2 rounded flex items-center ${isBulkUpdating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'}`}
        >
          {isBulkUpdating ? <><LoadingSpinner size="small" /><span className="ml-2">Processing...</span></> : 'Unpublish All'}
        </button>
        <span className="flex-1"></span>
        <button className="bg-yellow-400 text-white px-4 py-2 rounded flex items-center gap-2">
          <span className="text-xl">✨</span>
          Generate Images With AI
        </button>
      </div>

      {showAddQuestion && renderQuestionForm()}

      <QuestionsList 
        quizId={quizId} 
        onAddQuestion={() => setShowAddQuestion(true)}
        refreshTrigger={refreshTrigger} 
      />
    </div>
  );
} 