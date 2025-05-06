'use client'
import React, { useState } from 'react';
import { Question } from '@/types/QuizType';
import { databaseService } from '@/app/appwrite/database.service';
import LoadingSpinner from '../loader/LoadingSpinner';
import Swal from 'sweetalert2';

interface QuestionWithAnswer extends Question {
  correctAnswer: string;
}

interface QuestionItemProps {
  question: Question;
  index: number;
  onUpdate?: (question: Question) => void;
  onDelete?: (questionId: string | number) => void;
  onStatusChange?: (questionId: string | number, newStatus: 'Published' | 'Unpublished') => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ 
  question, 
  index,
  onUpdate,
  onDelete,
  onStatusChange
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>({...question});
  const [options, setOptions] = useState<string[]>(
    question.answers && question.answers.length > 0 
      ? [...question.answers] 
      : ['', '', '', '']
  );
  const [correctOption, setCorrectOption] = useState<number | null>(
    question.answers && (question as any).correctAnswer 
      ? question.answers.findIndex(a => a === (question as any).correctAnswer) 
      : null
  );
  const [error, setError] = useState<string | null>(null);
  const [yesOption, setYesOption] = useState<string>(
    question.type === 'Yes/No' && question.answers && question.answers[0] ? question.answers[0] : ''
  );
  const [noOption, setNoOption] = useState<string>(
    question.type === 'Yes/No' && question.answers && question.answers[1] ? question.answers[1] : ''
  );
  const [correctAnswer, setCorrectAnswer] = useState<'Yes' | 'No' | null>(
    question.type === 'Yes/No' && (question as any).correctAnswer 
      ? (question as any).correctAnswer === yesOption ? 'Yes' : 'No'
      : null
  );

  const correctAnswerValue = (question as any).correctAnswer || '';

  const handleDelete = async () => {
    if (!onDelete) return;
    
    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await onDelete(question.id);
        
        // Show success message
        Swal.fire(
          'Deleted!',
          'Your question has been deleted.',
          'success'
        );
      } catch (error) {
        // Show error message
        Swal.fire(
          'Error!',
          'Failed to delete the question.',
          'error'
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async () => {
    if (!onStatusChange) return;
    
    const newStatus = question.status === 'Published' ? 'Unpublished' : 'Published';
    const actionText = question.status === 'Published' ? 'unpublish' : 'publish';
    
    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
      title: 'Change Status',
      text: `Are you sure you want to ${actionText} this question?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: question.status === 'Published' ? '#F59E0B' : '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Yes, ${actionText} it!`
    });

    if (result.isConfirmed) {
      setIsChangingStatus(true);
      try {
        await onStatusChange(question.id, newStatus);
        
        // Show success message
        Swal.fire({
          title: newStatus === 'Published' ? 'Published!' : 'Unpublished!',
          text: `The question has been ${actionText}ed.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        // Show error message
        Swal.fire(
          'Error!',
          `Failed to ${actionText} the question.`,
          'error'
        );
      } finally {
        setIsChangingStatus(false);
      }
    }
  };

  const handleOpenEditModal = () => {
    setEditedQuestion({...question});
    setOptions(
      question.answers && question.answers.length > 0 
        ? [...question.answers] 
        : ['', '', '', '']
    );
    setCorrectOption(
      question.answers && (question as any).correctAnswer 
        ? question.answers.findIndex(a => a === (question as any).correctAnswer) 
        : null
    );
    setYesOption(
      question.type === 'Yes/No' && question.answers && question.answers[0] ? question.answers[0] : ''
    );
    setNoOption(
      question.type === 'Yes/No' && question.answers && question.answers[1] ? question.answers[1] : ''
    );
    setCorrectAnswer(
      question.type === 'Yes/No' && (question as any).correctAnswer 
        ? (question as any).correctAnswer === yesOption ? 'Yes' : 'No'
        : null
    );
    setShowEditModal(true);
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

  const handleUpdateQuestion = async () => {
    if (!editedQuestion.text.trim()) {
      setError('Question text is required');
      return;
    }

    try {
      setIsUpdating(true);
      
      let answers: string[] = [];
      let correctAnswerValue = '';
      
      if (editedQuestion.type === 'Multiple Choice') {
        answers = options.filter(opt => opt.trim() !== '');
        
        if (correctOption !== null && correctOption < answers.length) {
          correctAnswerValue = answers[correctOption];
        }
        
        if (answers.length < 2) {
          setError('At least 2 options are required for Multiple Choice questions');
          setIsUpdating(false);
          return;
        }
        
        if (correctAnswerValue === '') {
          setError('Please select a correct answer');
          setIsUpdating(false);
          return;
        }
      } else {
        if (!yesOption.trim() || !noOption.trim()) {
          setError('Both Yes and No options are required');
          setIsUpdating(false);
          return;
        }
        
        answers = [yesOption, noOption];
        
        if (!correctAnswer) {
          setError('Please select the correct answer (Yes or No)');
          setIsUpdating(false);
          return;
        }
        
        correctAnswerValue = correctAnswer === 'Yes' ? yesOption : noOption;
      }
      
      const updatedQuestion = {
        ...editedQuestion,
        answers,
        correctAnswer: correctAnswerValue
      };
      
      await databaseService.updateQuestion(String(question.id), updatedQuestion);
      
      if (onUpdate) {
        onUpdate(updatedQuestion);
      }
      
      setShowEditModal(false);
      setError(null);
    } catch (err: any) {
      setError(`Failed to update question: ${err.message}`);
      console.error('Error updating question:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <tr className={`border-b ${expanded ? 'bg-gray-50' : ''}`}>
        <td className="p-3 text-black text-center">
          <button 
            className="w-6 h-6 rounded-full hover:bg-gray-200"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '−' : '+'}
          </button>
        </td>
        <td className="p-3 text-black text-center">{index + 1}</td>
        <td className="p-3 text-black text-left">{question.text}</td>
        <td className="p-3 text-black text-center">
          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded ${
            question.status === 'Published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {question.status}
          </span>
        </td>
        <td className="p-3 text-black text-center">{question.type}</td>
        <td className="p-3 text-black text-center">
          {Array.isArray(question.answers) && question.answers.length > 0 
            ? (expanded 
                ? question.answers.map((answer, i) => (
                    <div key={i} className="mb-1 text-left">
                      <span className={`inline-block w-4 h-4 mr-2 rounded-full ${correctAnswerValue === answer ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      {answer}
                    </div>
                  ))
                : `${question.answers.length} options`)
            : 'No answers'
          }
        </td>
        {!expanded && (
          <>
            <td className="p-3 text-black text-center">
              <button 
                onClick={handleOpenEditModal}
                className="bg-blue-500 cursor-pointer text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Update
              </button>
            </td>
            <td className="p-3 text-center">
              {isChangingStatus ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="small" />
                </div>
              ) : (
                <button 
                  onClick={handleStatusChange}
                  className={`${
                    question.status === 'Published' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-teal-500 hover:bg-teal-600'
                  } text-white px-3 py-1 rounded flex items-center justify-center space-x-1`}
                >
                  <span>{question.status === 'Published' ? 'Unpublish' : 'Publish'}</span>
                  {question.status === 'Published' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </button>
              )}
            </td>
            <td className="p-3 text-center">
              {isDeleting ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="small" />
                </div>
              ) : (
                <button 
                  onClick={handleDelete}
                  className="bg-red-500 cursor-pointer text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </td>
          </>
        )}
        {expanded && (
          <td colSpan={3} className="p-3">
            <div className="flex space-x-2">
              <button 
                onClick={handleOpenEditModal}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Update
              </button>
              {isChangingStatus ? (
                <div className="flex justify-center items-center w-24 h-8">
                  <LoadingSpinner size="small" />
                </div>
              ) : (
                <button 
                  onClick={handleStatusChange}
                  className={`${
                    question.status === 'Published' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-teal-500 hover:bg-teal-600'
                  } text-white px-3 py-1 rounded flex items-center justify-center space-x-1`}
                >
                  <span>{question.status === 'Published' ? 'Unpublish' : 'Publish'}</span>
                  {question.status === 'Published' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </button>
              )}
              {isDeleting ? (
                <div className="flex justify-center items-center w-16 h-8">
                  <LoadingSpinner size="small" />
                </div>
              ) : (
                <button 
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </td>
        )}
      </tr>

      {/* Edit Question Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#DC3414] text-white p-4 text-xl font-semibold -mx-6 -mt-6 rounded-t-lg mb-6 flex justify-between items-center">
              <span>Edit Question</span>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Question (Max Characters 80)</label>
                <input
                  type="text"
                  value={editedQuestion.text}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
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
                      onClick={() => setEditedQuestion({ ...editedQuestion, emoji })}
                      className={`text-2xl hover:scale-110 transition-transform ${editedQuestion.emoji === emoji ? 'ring-2 ring-blue-500 rounded-full' : ''}`}
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
                  value={editedQuestion.type}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, type: e.target.value })}
                  className="w-full text-black border rounded-lg px-4 py-2"
                >
                  <option>Yes/No</option>
                  <option>Multiple Choice</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  value={editedQuestion.status}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, status: e.target.value })}
                  className="w-full text-black border rounded-lg px-4 py-2"
                >
                  <option value="Published">Published</option>
                  <option value="Unpublished">Unpublished</option>
                </select>
              </div>

              {editedQuestion.type === 'Multiple Choice' ? (
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
                  value={editedQuestion.responseText}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, responseText: e.target.value })}
                  placeholder="Enter a paragraph explaining the correct answer"
                  className="w-full text-black border rounded-lg px-4 py-2 h-32"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                {isUpdating ? (
                  <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded">
                    <LoadingSpinner size="small" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleUpdateQuestion}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Update Question
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionItem; 