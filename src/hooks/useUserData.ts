import { useState, useEffect, useCallback } from 'react';

export type Task = {
    id: string;
    boardId: string;
    title: string;
    description?: string;
    createdAt: string;
    dueDate: string | null;
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

// TODO: rename userEmail to userId and make sure its correct and shit
export function useUserData(userEmail: string | null) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const storageKey = userEmail ? `userData-${userEmail}` : null;
        if (!storageKey) {
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('app_token')
        const loadData = async () => {
            setIsLoading(true);

            // attempt to fetch from DB if it's a real user
            // TODO: fix logic
            if (userEmail && userEmail !== 'anonymous' || token) {
                try {
                    const response = await fetch('/api/data/sync', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },

                    });
                    if (response.ok) {
                        const { data } = await response.json();

                        setUserData({ boards: data.boards });

                        localStorage.setItem(storageKey, JSON.stringify({ boards: data.boards }));
                        setIsLoading(false);

                        return; // Exit here, we are done
                    } else {

                        // same block is used below
                        if (!response.ok) {
                            if (response.status === 401) {
                                throw new Error("Your session has expired. Please log in again.");

                            }
                            throw new Error("Failed to sync with the server. Please try again later.");
                        }
                    }

                } catch (error) {
                    throw error
                }
            }

            // --- FALLBACK LOGIC ---
            // This runs for anonymous users, or if the API fetch fails or returns a 404.
            const localData = localStorage.getItem(storageKey);
            setUserData(localData ? JSON.parse(localData) : { boards: [] });
            setIsLoading(false);
        };

        loadData();
    }, [userEmail]);


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

    const addTask = useCallback((boardId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'boardId'>) => {
        const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            boardId: boardId,
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

    const editBoardName = useCallback((boardId: string, newName: string) => {
        if (!newName.trim()) return;

        setUserData(prev => {
            if (!prev) return null;

            const updatedBoards = prev.boards.map(board => {
                // If this isn't the board we're looking for, return it as-is
                if (board.id !== boardId) {
                    return board;
                }

                return { ...board, title: newName.trim() };
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

    // Example for drag-and-drop to change priority- was implemented before, now removed.
    const setTaskPriority = (boardId: string, taskId: string, priority: boolean) => {
        editTask(boardId, taskId, { priority });
    };

    const syncToDatabase = useCallback(async () => {
        // Don't sync if there's no data or not logged in with a real ID or token doesnt exist..
        const token = localStorage.getItem('app_token')

        if (!userData || !token || !userEmail || userEmail === 'anonymous') return;

        setIsSyncing(true);
        try {
            const r = await fetch('/api/data/sync', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ boards: userData.boards }),
            });

            if (!r.ok) {
                if (r.status === 401) {
                    throw new Error("Your session has expired. Please log in again.");

                }
                throw new Error("Failed to sync with the server. Please try again later.");
            }

        } catch (error) {

            throw new Error("Failed to sync with the server. Are you online?");
        } finally {
            setIsSyncing(false);
        }
    }, [userData, userEmail]);

    return {
        isLoading,
        boards: userData?.boards ?? [],
        isSyncing,
        getBoard,
        addBoard,
        editBoardName,
        addTask,
        editTask,
        syncToDatabase,
        removeBoard,
        removeTask,
        setTaskPriority,
    };
}