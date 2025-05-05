<<<<<<< HEAD
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, appwriteConfig } from './config';

export const databaseService = {
    collections: {
        quizzes: 'quizzes',
        questions: 'questions',
        tags: 'tags'
    },

    async testConnection() {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                this.collections.quizzes,
                [
                    Query.limit(1)
                ]
            );
            console.log('Database connection successful!');
            return true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    },

    async testCreateAndFetch() {
        try {
            const testQuiz = await this.createQuiz({
                quizName: "Test Quiz",
                quizTitle: "Test Quiz Title",
                selectedColor: "purple",
                basePoints: 5,
                pointsPerSecond: 10,
                timePerQuestion: 30,
                aboutTitle: "Test About",
                aboutParagraph: "This is a test quiz",
                status: "Unpublished",
                tags: ["test"]
            });

            console.log('Test quiz created:', testQuiz);

            const fetchedQuiz = await databases.getDocument(
                appwriteConfig.databaseId,
                this.collections.quizzes,
                testQuiz.$id
            );

            console.log('Test quiz fetched:', fetchedQuiz);
            return { created: testQuiz, fetched: fetchedQuiz };
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    },

    async createQuiz(quizData: any) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'createQuiz',
                    data: {
                        quizName: quizData.quizName,
                        quizTitle: quizData.quizTitle,
                        selectedColor: quizData.selectedColor,
                        basePoints: quizData.basePoints,
                        pointsPerSecond: quizData.pointsPerSecond,
                        timePerQuestion: quizData.timePerQuestion,
                        aboutTitle: quizData.aboutTitle,
                        aboutParagraph: quizData.aboutParagraph,
                        status: quizData.status || 'Unpublished',
                        template: quizData.template || 'Default Template',
                        duplicate: quizData.duplicate || 0,
                        publishedDate: quizData.publishedDate || new Date().toISOString(),
                        tags: quizData.tags || [],
                        questions: '0/0'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create quiz');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        }
    },

    async listQuizzes() {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'listQuizzes'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch quizzes');
            }

            const data = await response.json();
            return data.documents;
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            throw error;
        }
    },

    async deleteQuiz(quizId: string) {
        try {
            console.log('Attempting to delete quiz with ID:', quizId);
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteQuiz',
                    data: { quizId }
                })
            });

            console.log('Delete response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Delete error details:', errorData);
                throw new Error(errorData.error || 'Failed to delete quiz');
            }

            const result = await response.json();
            console.log('Delete result:', result);
            return result.success;
        } catch (error) {
            console.error('Error deleting quiz:', error);
            throw error;
        }
    },

    async updateQuizStatus(quizId: string, status: 'Published' | 'Unpublished') {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                this.collections.quizzes,
                quizId,
                {
                    status: status
                }
            );
        } catch (error) {
            console.error('Error updating quiz status:', error);
            throw error;
        }
    },

    async createQuestion(questionData: any, quizId: string) {
        try {
            let answers = '';
            
            if (Array.isArray(questionData.answers)) {
                const correctAnswer = questionData.correctAnswer || '';
                answers = questionData.answers.join(',');
                
                answers += `#${correctAnswer}`;
            } else if (typeof questionData.answers === 'string') {
                answers = questionData.answers;
            }
            
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'createQuestion',
                    data: {
                        quizId: quizId,
                        text: questionData.text,
                        type: questionData.type,
                        answers: answers,
                        emoji: questionData.emoji || '',
                        responseText: questionData.responseText || '',
                        status: questionData.status || 'Unpublished'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create question');
            }

            await this.updateQuizQuestionCount(quizId);

            return await response.json();
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    },

    async listQuizQuestions(quizId: string) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'listQuestions',
                    data: { quizId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch questions');
            }

            const data = await response.json();
            
            console.log('Raw questions data:', data.documents);
            
            const processedQuestions = data.documents.map((q: any) => {
                let answers = [];
                let correctAnswer = '';
                
                if (q.answers) {
                    if (q.answers.includes('#')) {
                        const parts = q.answers.split('#');
                        answers = parts[0].split(',');
                        correctAnswer = parts[1] || '';
                    } else {
                        answers = q.answers.split(',');
                    }
                }
                
                return {
                    ...q,
                    answers,
                    correctAnswer
                };
            });
            
            console.log('Processed questions:', processedQuestions);
            return processedQuestions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },

    async updateQuizQuestionCount(quizId: string) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateQuizQuestionCount',
                    data: { quizId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update question count');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating quiz question count:', error);
            throw error;
        }
    },

    async createTag(tagData: any) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                this.collections.tags,
                ID.unique(),
                {
                    name: tagData.name,
                    quizIds: tagData.quizIds || []
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    },

    async deleteQuestion(questionId: string) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteQuestion',
                    data: { questionId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete question');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    },

    async updateQuestion(questionId: string, questionData: any) {
        try {
            let answers = '';
            
            if (Array.isArray(questionData.answers)) {
                const correctAnswer = questionData.correctAnswer || '';
                answers = questionData.answers.join(',');
                
                answers += `#${correctAnswer}`;
            } else if (typeof questionData.answers === 'string') {
                answers = questionData.answers;
            }

            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateQuestion',
                    data: {
                        questionId,
                        text: questionData.text,
                        type: questionData.type,
                        answers: answers,
                        emoji: questionData.emoji || '',
                        responseText: questionData.responseText || '',
                        status: questionData.status || 'Unpublished'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update question');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    },

    async updateQuestionStatus(questionId: string, status: 'Published' | 'Unpublished') {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateQuestionStatus',
                    data: {
                        questionId,
                        status
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update question status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating question status:', error);
            throw error;
        }
    }
=======
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, appwriteConfig } from './config';

export const databaseService = {
    collections: {
        quizzes: 'quizzes',
        questions: 'questions',
        tags: 'tags'
    },

    async testConnection() {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                this.collections.quizzes,
                [
                    Query.limit(1)
                ]
            );
            console.log('Database connection successful!');
            return true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    },

    async testCreateAndFetch() {
        try {
            const testQuiz = await this.createQuiz({
                quizName: "Test Quiz",
                quizTitle: "Test Quiz Title",
                selectedColor: "purple",
                basePoints: 5,
                pointsPerSecond: 10,
                timePerQuestion: 30,
                aboutTitle: "Test About",
                aboutParagraph: "This is a test quiz",
                status: "Unpublished",
                tags: ["test"]
            });

            console.log('Test quiz created:', testQuiz);

            const fetchedQuiz = await databases.getDocument(
                appwriteConfig.databaseId,
                this.collections.quizzes,
                testQuiz.$id
            );

            console.log('Test quiz fetched:', fetchedQuiz);
            return { created: testQuiz, fetched: fetchedQuiz };
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    },

    async createQuiz(quizData: any) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'createQuiz',
                    data: {
                        quizName: quizData.quizName,
                        quizTitle: quizData.quizTitle,
                        selectedColor: quizData.selectedColor,
                        basePoints: quizData.basePoints,
                        pointsPerSecond: quizData.pointsPerSecond,
                        timePerQuestion: quizData.timePerQuestion,
                        aboutTitle: quizData.aboutTitle,
                        aboutParagraph: quizData.aboutParagraph,
                        status: quizData.status || 'Unpublished',
                        template: quizData.template || 'Default Template',
                        duplicate: quizData.duplicate || 0,
                        publishedDate: quizData.publishedDate || new Date().toISOString(),
                        tags: quizData.tags || [],
                        questions: '0/0'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create quiz');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        }
    },

    async listQuizzes() {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'listQuizzes'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch quizzes');
            }

            const data = await response.json();
            return data.documents;
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            throw error;
        }
    },

    async deleteQuiz(quizId: string) {
        try {
            console.log('Attempting to delete quiz with ID:', quizId);
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteQuiz',
                    data: { quizId }
                })
            });

            console.log('Delete response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Delete error details:', errorData);
                throw new Error(errorData.error || 'Failed to delete quiz');
            }

            const result = await response.json();
            console.log('Delete result:', result);
            return result.success;
        } catch (error) {
            console.error('Error deleting quiz:', error);
            throw error;
        }
    },

    async updateQuizStatus(quizId: string, status: 'Published' | 'Unpublished') {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                this.collections.quizzes,
                quizId,
                {
                    status: status
                }
            );
        } catch (error) {
            console.error('Error updating quiz status:', error);
            throw error;
        }
    },

    async createQuestion(questionData: any, quizId: string) {
        try {
            let answers = '';
            
            if (Array.isArray(questionData.answers)) {
                const correctAnswer = questionData.correctAnswer || '';
                answers = questionData.answers.join(',');
                
                answers += `#${correctAnswer}`;
            } else if (typeof questionData.answers === 'string') {
                answers = questionData.answers;
            }
            
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'createQuestion',
                    data: {
                        quizId: quizId,
                        text: questionData.text,
                        type: questionData.type,
                        answers: answers,
                        emoji: questionData.emoji || '',
                        responseText: questionData.responseText || '',
                        status: questionData.status || 'Unpublished'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create question');
            }

            await this.updateQuizQuestionCount(quizId);

            return await response.json();
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    },

    async listQuizQuestions(quizId: string) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'listQuestions',
                    data: { quizId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch questions');
            }

            const data = await response.json();
            
            console.log('Raw questions data:', data.documents);
            
            const processedQuestions = data.documents.map((q: any) => {
                let answers = [];
                let correctAnswer = '';
                
                if (q.answers) {
                    if (q.answers.includes('#')) {
                        const parts = q.answers.split('#');
                        answers = parts[0].split(',');
                        correctAnswer = parts[1] || '';
                    } else {
                        answers = q.answers.split(',');
                    }
                }
                
                return {
                    ...q,
                    answers,
                    correctAnswer
                };
            });
            
            console.log('Processed questions:', processedQuestions);
            return processedQuestions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },

    async updateQuizQuestionCount(quizId: string) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateQuizQuestionCount',
                    data: { quizId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update question count');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating quiz question count:', error);
            throw error;
        }
    },

    async createTag(tagData: any) {
        try {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                this.collections.tags,
                ID.unique(),
                {
                    name: tagData.name,
                    quizIds: tagData.quizIds || []
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    },

    async deleteQuestion(questionId: string) {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteQuestion',
                    data: { questionId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete question');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    },

    async updateQuestion(questionId: string, questionData: any) {
        try {
            let answers = '';
            
            if (Array.isArray(questionData.answers)) {
                const correctAnswer = questionData.correctAnswer || '';
                answers = questionData.answers.join(',');
                
                answers += `#${correctAnswer}`;
            } else if (typeof questionData.answers === 'string') {
                answers = questionData.answers;
            }

            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateQuestion',
                    data: {
                        questionId,
                        text: questionData.text,
                        type: questionData.type,
                        answers: answers,
                        emoji: questionData.emoji || '',
                        responseText: questionData.responseText || '',
                        status: questionData.status || 'Unpublished'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update question');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    },

    async updateQuestionStatus(questionId: string, status: 'Published' | 'Unpublished') {
        try {
            const response = await fetch('/api/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateQuestionStatus',
                    data: {
                        questionId,
                        status
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update question status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating question status:', error);
            throw error;
        }
    }
>>>>>>> 5ee69d6c625aad425581d5decca759e072923a54
}; 