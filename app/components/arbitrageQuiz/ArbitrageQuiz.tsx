'use client'
import React, { useState, useEffect } from 'react';
import CreateQuizForm from './CreateQuizForm';
import QuizDetails from './QuizDetails';
import { databaseService } from '../../appwrite/database.service';
import LoadingSpinner from '../loader/LoadingSpinner';
import { IconExpand, IconDuplicate, IconLink, IconDelete, IconEdit, IconDownload } from '@/utils/utils';
import Swal from 'sweetalert2';


function ArbitrageQuiz() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const fetchedQuizzes = await databaseService.listQuizzes();
      setQuizzes(fetchedQuizzes);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateQuiz = async (newQuiz: any) => {
    try {
      setActionLoading(true);
      await databaseService.createQuiz(newQuiz);
      setShowCreateForm(false);
      fetchQuizzes(); 
      
      Swal.fire({
        title: 'Success!',
        text: 'Quiz created successfully',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err: any) {
      setError(err.message);
      
      Swal.fire({
        title: 'Error!',
        text: `Failed to create quiz: ${err.message}`,
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
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
      try {
        setActionLoading(true);
        const success = await databaseService.deleteQuiz(quizId);
        
        if (success) {
          setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.$id !== quizId));
          setError(null);
          
          Swal.fire(
            'Deleted!',
            'Your quiz has been deleted.',
            'success'
          );
        }
      } catch (err: any) {
        setError(`Failed to delete quiz: ${err.message}`);
        
        Swal.fire(
          'Error!',
          `Failed to delete quiz: ${err.message}`,
          'error'
        );
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleStatusChange = async (quizId: string, newStatus: 'Published' | 'Unpublished') => {
    try {
      setActionLoading(true);
      await databaseService.updateQuizStatus(quizId, newStatus);
      fetchQuizzes(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuizClick = (quiz: any) => {
    setSelectedQuiz(quiz);
  };

  if (selectedQuiz) {
    return (
      <QuizDetails
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg text-gray-600">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans p-4 relative">
      {actionLoading && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <LoadingSpinner size="medium" />
            <p className="mt-4 text-gray-700">Processing...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-semibold text-sm">Publish</button>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm">Unpublish</button>
        <input
          type="text"
          placeholder="Search quizzes..."
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none text-black focus:ring text-sm ml-2"
        />
        <div className="flex-1"></div>
        <input
          type="text"
          placeholder="Search Tags..."
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none text-black focus:ring text-sm"
        />
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gray-500 cursor-pointer hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold text-sm ml-2"
        >
          Add new Quiz
        </button>
      </div>

      {showCreateForm && (
        <CreateQuizForm 
          onCancel={() => setShowCreateForm(false)}
          onCreateQuiz={handleCreateQuiz}
          isPrizeQuiz={false}
        />
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-base">
          <thead>
            <tr className="bg-[#DC3414] text-white text-base h-12">
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Expand</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center"><input type='checkbox' className='w-4 h-4 align-middle' /></th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">#</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Quiz name</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Status</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Questions / Public</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Select Template</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Duplicate</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Link</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Update</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Status</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Published Date</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Split</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Delete</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Edit</th>
              <th className="py-3 px-2 font-semibold whitespace-nowrap text-center">Download <br /> CSV</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, idx) => (
              <tr key={quiz.$id} className={`${idx % 2 === 1 ? 'bg-gray-200' : 'bg-white'} border-b border-gray-200 text-black text-base h-14`}>
                <td className="px-2 py-2 align-middle"><IconExpand /></td>
                <td className="px-2 py-2 align-middle"><input type="checkbox" className="w-4 h-4 align-middle" /></td>
                <td className="px-2 py-2 align-middle font-normal">{idx + 1}</td>
                <td 
                  className="px-2 py-2 align-middle text-blue-600 underline cursor-pointer whitespace-nowrap font-normal"
                  onClick={() => handleQuizClick(quiz)}
                >
                  {quiz.quizName}
                </td>
                <td className="px-2 py-2 align-middle font-normal">{quiz.status}</td>
                <td className="px-2 py-2 align-middle font-normal">{quiz.questions}</td>
                <td className="px-2 py-2 align-middle">
                  <select className="border rounded px-2 py-1 min-w-[170px] text-base font-normal">
                    <option>{quiz.template}</option>
                  </select>
                </td>
                <td className="px-2 py-2 align-middle">
                  <span className="inline-flex cursor-pointer items-center gap-1">
                    <IconDuplicate />
                    <span className="text-gray-800 font-normal">({quiz.duplicate || 0})</span>
                  </span>
                </td>
                <td className="px-2 py-2 align-middle"><IconLink /></td>
                <td className="px-2 py-2 align-middle">
                  <a href="#" className="text-blue-600 underline font-normal">Update</a>
                </td>
                <td className="px-2 py-2 align-middle">
                  <button
                    onClick={() => handleStatusChange(quiz.$id, quiz.status === 'Published' ? 'Unpublished' : 'Published')}
                    className={`underline font-normal ${quiz.status === 'Published' ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {quiz.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                </td>
                <td className="px-2 py-2 align-middle font-normal">{new Date(quiz.publishedDate).toLocaleDateString()}</td>
                <td className="px-2 py-2 align-middle">
                  <a href="#" className="underline font-normal">Split <span className="text-gray-800">({quiz.split || 0})</span></a>
                </td>
                <td className="px-2 py-2 align-middle text-center">
                  <button 
                    onClick={() => handleDeleteQuiz(quiz.$id)}
                    className="hover:bg-red-50 rounded cursor-pointer"
                  >
                    <IconDelete />
                  </button>
                </td>
                <td className="px-2 py-2 align-middle text-center">
                  <button className="hover:bg-gray-100 rounded cursor-pointer"><IconEdit /></button>
                </td>
                <td className="px-2 py-2 align-middle text-center">
                  <button className="hover:bg-red-50 rounded cursor-pointer"><IconDownload /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArbitrageQuiz;

