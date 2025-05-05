'use client'
import { CreateQuizFormProps } from '@/types/QuizType';
import React, { useState } from 'react';

 

export default function CreateQuizForm({ onCancel, onCreateQuiz }: CreateQuizFormProps) {
  const [formData, setFormData] = useState({
    quizName: '',
    quizTitle: '',
    selectedColor: '',
    basePoints: '5',
    pointsPerSecond: '10',
    timePerQuestion: '10',
    aboutTitle: '',
    aboutParagraph: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const colors = [
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'violet', class: 'bg-violet-500' },
    { name: 'yellow', class: 'bg-yellow-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'cyan', class: 'bg-cyan-500' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuiz = {
      ...formData,
      tags,
      status: 'Unpublished',
      template: 'Default Template',
      duplicate: 0,
      publishedDate: new Date().toISOString().split('T')[0],
    };
    onCreateQuiz(newQuiz);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg mb-6">
      <div className="bg-[#DC3414] text-white p-4 text-xl font-semibold">
        Create Arbitrage Quiz
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-gray-700 mb-2">Upload Image Manual</h3>
          <div className="flex items-center gap-4">
            <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Upload Image
            </button>
            <span className="text-gray-600">Please only upload images in ratio aspect 16:9</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Quiz Name</label>
            <input
              type="text"
              name="quizName"
              value={formData.quizName}
              onChange={handleInputChange}
              placeholder="Enter Quiz Name"
              className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Quiz Title</label>
            <input
              type="text"
              name="quizTitle"
              value={formData.quizTitle}
              onChange={handleInputChange}
              placeholder="Enter Quiz Title"
              className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Select first color</label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  onClick={() => setFormData(prev => ({ ...prev, selectedColor: color.name }))}
                  className={`w-6 h-6 text-black rounded-full ${color.class} hover:ring-2 hover:ring-offset-2 hover:ring-${color.name}-500 
                    ${formData.selectedColor === color.name ? 'ring-2 ring-offset-2' : ''}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Base Points</label>
            <input
              type="number"
              name="basePoints"
              value={formData.basePoints}
              onChange={handleInputChange}
              className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Points Per Seconds</label>
            <input
              type="number"
              name="pointsPerSecond"
              value={formData.pointsPerSecond}
              onChange={handleInputChange}
              className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Time per Question</label>
            <input
              type="number"
              name="timePerQuestion"
              value={formData.timePerQuestion}
              onChange={handleInputChange}
              className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-700 mb-4">About Quiz</h3>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Choose Emoji</label>
              <div className="flex gap-2">
                {['👍', '❤️', '😃', '😮', '🙏', '👎', '😡'].map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
                <button type="button" className="text-2xl text-black hover:scale-110 transition-transform">+</button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Title</label>
              <input
                type="text"
                name="aboutTitle"
                value={formData.aboutTitle}
                onChange={handleInputChange}
                placeholder="About the Quiz"
                className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Paragraph</label>
              <textarea
                name="aboutParagraph"
                value={formData.aboutParagraph}
                onChange={handleInputChange}
                placeholder="Enter Paragraph"
                rows={4}
                className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-400 text-black rounded-full flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type and press Enter to add tags"
                className="w-full border text-black rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-600"
          >
            CREATE QUIZ
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
} 