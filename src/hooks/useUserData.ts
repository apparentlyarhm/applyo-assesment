import { useState, useEffect, useCallback } from 'react';

export type Task = {
    id: string;
    boardId: string;
    title: string;
    description?: string;
    createdAt: string;
    dueDate: string;
    status: TaskStatus;
    priority: boolean
};

export type Board = {
    title: string;
    id: string;
    tasks: Task[];
};

export type UserData = {
    boards: Board[];
};

export type TaskStatus = 'pending' | 'completed';


const STORAGE_KEY = 'appData'; // A single key for the logged-in user

export function useUserData(userEmail: string | null) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userEmail) {
            setIsLoading(false);
            return;
        }

        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            setUserData(JSON.parse(raw));
        } else {
            setUserData({ boards: [] });
        }
        setIsLoading(false);
    }, [userEmail]); // Re-run if the user logs in/out


    useEffect(() => {
        if (userData && !isLoading) { // Don't save during initial load
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        }
    }, [userData, isLoading]);


    const addBoard = useCallback((title: string) => {
        const newBoard: Board = {
            id: crypto.randomUUID(),
            title,
            tasks: [], // Start with an empty tasks array
        };

        setUserData(prev => ({
            ...prev,
            boards: [...(prev?.boards ?? []), newBoard],
        }));

        return newBoard;

    }, []);

    const getBoard = useCallback((boardId: string) => {
        return userData?.boards.find(b => b.id === boardId);
    }, [userData]);

    const addTask = useCallback((boardId: string, taskData: Omit<Task, 'id' | 'createdAt'>) => {
        const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        setUserData(prev => {
            if (!prev) return null;
            const newBoards = prev.boards.map(board => {
                if (board.id === boardId) {
                    return { ...board, tasks: [...board.tasks, newTask] };
                }
                return board;
            });
            return { ...prev, boards: newBoards };
        });
    }, []);

    const removeBoard = useCallback((boardId: string) => {
        setUserData(prev => {
            if (!prev) return null;

            // Filter out the board with the matching ID
            const updatedBoards = prev.boards.filter(board => board.id !== boardId);
            return { ...prev, boards: updatedBoards };
        });
    }, []);

    const removeTask = useCallback((boardId: string, taskId: string) => {
        setUserData(prev => {
            if (!prev) return null;

            // We use .map() to create a new boards array
            const updatedBoards = prev.boards.map(board => {
                // If this isn't the board we're looking for, return it unchanged
                if (board.id !== boardId) {
                    return board;
                }

                const updatedTasks = board.tasks.filter(task => task.id !== taskId);
                return { ...board, tasks: updatedTasks };
            });

            return { ...prev, boards: updatedBoards };
        });
    }, []);

    const editTask = useCallback((boardId: string, taskId: string, updates: Partial<Task>) => {
        console.log(`HOOK: editTask received -> boardId: ${boardId}, taskId: ${taskId}, updates:`, updates);
        
        setUserData(prev => {
            if (!prev) return null;
            const newBoards = prev.boards.map(board => {
                if (board.id === boardId) {
                    const newTasks = board.tasks.map(task => {
                        if (task.id === taskId) {
                            return { ...task, ...updates };
                        }
                        return task;
                    });
                    return { ...board, tasks: newTasks };
                }
                return board;
            });
            return { ...prev, boards: newBoards };
        });
    }, []);

    // Example for drag-and-drop to change priority
    const setTaskPriority = (boardId: string, taskId: string, priority: boolean) => {
        editTask(boardId, taskId, { priority });
    };

    //  sync to MongoDB
    //   const syncToDatabase = async () => {
    //     if (!userData) return;
    //     console.log("Syncing to DB:", userData);
    //     // await fetch('/api/user/sync', {
    //     //   method: 'POST',
    //     //   body: JSON.stringify(userData)
    //     // });
    //   };

    return {
        isLoading,
        boards: userData?.boards ?? [],
        getBoard,
        addBoard,
        addTask,
        editTask,
        removeBoard,
        removeTask,
        setTaskPriority,
        // syncToDatabase
    };
}