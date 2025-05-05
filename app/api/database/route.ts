import { NextResponse } from 'next/server';
import { Client, Databases, ID, Permission, Role, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY || '';

const databases = new Databases(client);

const checkEnvVariables = () => {
    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    }
    if (!process.env.APPWRITE_API_KEY) {
        throw new Error('APPWRITE_API_KEY is not set');
    }
    if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
        throw new Error('NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set');
    }
};

export async function POST(req: Request) {
    try {
        checkEnvVariables();

        const { action, data } = await req.json();
        console.log('Action:', action);
        console.log('Environment variables:', {
            projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            hasApiKey: !!process.env.APPWRITE_API_KEY
        });

        switch (action) {
            case 'createQuiz':
                console.log('Creating quiz with data:', data);
                
                let tagsValue = '';
                if (Array.isArray(data.tags)) {
                    tagsValue = data.tags.join(',').substring(0, 30);
                } else if (typeof data.tags === 'string') {
                    tagsValue = data.tags.substring(0, 30);
                }
                
                const processedData = {
                    quizName: data.quizName || '',
                    quizTitle: data.quizTitle || '',
                    selectedColor: data.selectedColor || '',
                    basePoints: parseInt(data.basePoints) || 0,
                    pointsPerSecond: parseInt(data.pointsPerSecond) || 0,
                    timePerQuestion: parseInt(data.timePerQuestion) || 0,
                    aboutTitle: data.aboutTitle || '',
                    aboutParagraph: data.aboutParagraph || '',
                    status: data.status || 'Unpublished',
                    template: data.template || 'Default Template',
                    duplicate: data.duplicate?.toString() || '0',
                    publishedDate: data.publishedDate || new Date().toISOString().split('T')[0],
                    tags: tagsValue,
                    questions: data.questions || '0/0'
                };
                
                console.log('Processed data:', processedData);
                
                const quiz = await databases.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    'quizzes',
                    ID.unique(),
                    processedData,
                    [
                        Permission.read(Role.any()),
                        Permission.update(Role.any()),
                        Permission.delete(Role.any())
                    ]
                );
                return NextResponse.json(quiz);

            case 'listQuizzes':
                console.log('Listing quizzes');
                const quizzes = await databases.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    'quizzes'
                );
                return NextResponse.json(quizzes);

            case 'createQuestion':
                console.log('Creating question for quiz:', data.quizId);
                console.log('Question data:', data);
                
                try {
                    const question = await databases.createDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'questions',
                        ID.unique(),
                        {
                            quizId: data.quizId,
                            text: data.text,
                            type: data.type,
                            answers: data.answers,
                            emoji: data.emoji || '',
                            responseText: data.responseText || '',
                            status: data.status || 'Unpublished'
                        },
                        [
                            Permission.read(Role.any()),
                            Permission.update(Role.any()),
                            Permission.delete(Role.any())
                        ]
                    );
                    
                    console.log('Question created successfully:', question);
                    return NextResponse.json(question);
                } catch (questionError: any) {
                    console.error('Error creating question:', questionError);
                    return NextResponse.json({ 
                        error: questionError.message,
                        details: questionError.response || 'Error creating question'
                    }, { status: 500 });
                }
                
            case 'listQuestions':
                console.log('Listing questions for quiz:', data.quizId);
                
                try {
                    const questions = await databases.listDocuments(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'questions',
                        [
                            Query.equal('quizId', data.quizId)
                        ]
                    );
                    
                    console.log(`Found ${questions.documents.length} questions for quiz ${data.quizId}`);
                    
                    // Additional debug info
                    if (questions.documents.length === 0) {
                        console.log('No questions found. Checking if quizId exists...');
                        try {
                            const quiz = await databases.getDocument(
                                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                                'quizzes',
                                data.quizId
                            );
                            console.log('Quiz exists:', quiz.quizName);
                        } catch (err) {
                            console.log('Quiz not found. Invalid quizId?');
                        }
                    } else {
                        // Log first question as sample
                        console.log('Sample question data:', questions.documents[0]);
                    }
                    
                    return NextResponse.json(questions);
                } catch (listQuestionsError: any) {
                    console.error('Error listing questions:', listQuestionsError);
                    return NextResponse.json({ 
                        error: listQuestionsError.message,
                        details: listQuestionsError.response || 'Error listing questions'
                    }, { status: 500 });
                }
                
            case 'updateQuizQuestionCount':
                console.log('Updating question count for quiz:', data.quizId);
                
                try {
                    // Get the current question count
                    const questions = await databases.listDocuments(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'questions',
                        [
                            Query.equal('quizId', data.quizId)
                        ]
                    );
                    
                    const totalQuestions = questions.documents.length;
                    const publishedQuestions = questions.documents.filter(q => q.status === 'Published').length;
                    
                    // Update the quiz with the new question count
                    const updatedQuiz = await databases.updateDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'quizzes',
                        data.quizId,
                        {
                            questions: `${publishedQuestions}/${totalQuestions}`
                        }
                    );
                    
                    console.log('Updated quiz question count:', updatedQuiz.questions);
                    return NextResponse.json(updatedQuiz);
                } catch (updateError: any) {
                    console.error('Error updating question count:', updateError);
                    return NextResponse.json({ 
                        error: updateError.message,
                        details: updateError.response || 'Error updating question count'
                    }, { status: 500 });
                }

            case 'deleteQuiz':
                console.log('Deleting quiz with ID:', data.quizId);
                try {
                    await databases.deleteDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'quizzes',
                        data.quizId
                    );
                    console.log('Quiz deleted successfully, ID:', data.quizId);
                    return NextResponse.json({ 
                        success: true, 
                        message: 'Quiz deleted successfully',
                        deletedId: data.quizId
                    });
                } catch (deleteError: any) {
                    console.error('Error in delete operation:', deleteError);
                    console.error('Delete error details:', deleteError.response || 'No response');
                    return NextResponse.json({ 
                        success: false, 
                        error: deleteError.message,
                        details: deleteError.response || 'Error deleting quiz' 
                    }, { status: 500 });
                }

            case 'deleteQuestion':
                console.log('Deleting question with ID:', data.questionId);
                try {
                    await databases.deleteDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'questions',
                        data.questionId
                    );
                    console.log('Question deleted successfully, ID:', data.questionId);
                    return NextResponse.json({ 
                        success: true, 
                        message: 'Question deleted successfully',
                        deletedId: data.questionId
                    });
                } catch (deleteError: any) {
                    console.error('Error deleting question:', deleteError);
                    console.error('Delete error details:', deleteError.response || 'No response');
                    return NextResponse.json({ 
                        success: false, 
                        error: deleteError.message,
                        details: deleteError.response || 'Error deleting question' 
                    }, { status: 500 });
                }

            case 'updateQuestionStatus':
                console.log('Updating question status:', data.questionId, 'to', data.status);
                try {
                    const updatedQuestion = await databases.updateDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'questions',
                        data.questionId,
                        {
                            status: data.status
                        }
                    );
                    console.log('Question status updated successfully');
                    return NextResponse.json(updatedQuestion);
                } catch (updateError: any) {
                    console.error('Error updating question status:', updateError);
                    return NextResponse.json({ 
                        error: updateError.message,
                        details: updateError.response || 'Error updating question status'
                    }, { status: 500 });
                }

            case 'updateQuestion':
                console.log('Updating question:', data.questionId);
                console.log('Question data:', data);
                
                try {
                    // Process answers - if it's a string with formatted answers and correctAnswer
                    let answers = data.answers;
                    
                    // Check if answers is in array format and needs to be processed
                    if (Array.isArray(data.answers)) {
                        if (data.correctAnswer) {
                            answers = data.answers.join(',') + '#' + data.correctAnswer;
                        } else {
                            answers = data.answers.join(',');
                        }
                    }
                    
                    const updatedQuestion = await databases.updateDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        'questions',
                        data.questionId,
                        {
                            text: data.text,
                            type: data.type,
                            answers: answers,
                            emoji: data.emoji || '',
                            responseText: data.responseText || '',
                            status: data.status || 'Unpublished'
                        }
                    );
                    
                    console.log('Question updated successfully');
                    return NextResponse.json(updatedQuestion);
                } catch (updateError: any) {
                    console.error('Error updating question:', updateError);
                    return NextResponse.json({ 
                        error: updateError.message,
                        details: updateError.response || 'Error updating question'
                    }, { status: 500 });
                }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Database API Error:', error);
        if (error.response) {
            console.error('Error response:', error.response);
        }
        return NextResponse.json({ 
            error: error.message,
            details: error.response || 'No additional details'
        }, { status: 500 });
    }
} 