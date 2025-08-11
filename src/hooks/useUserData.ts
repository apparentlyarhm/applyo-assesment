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

// dont really need to export
interface StoredUserData {
    data: UserData;
    owner: string | 'anonymous'; // Track who this data belongs to
}

export type UserData = {
    boards: Board[];
    lastUpdated?: number
};

export type TaskStatus = 'pending' | 'completed';


const STORAGE_KEY = 'appData'; // A single key for the logged-in user

// TODO: rename userEmail to userId and make sure its correct and shit
export function useUserData(userEmail: string | null) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const [conflict, setConflict] = useState<{ local: UserData, remote: UserData } | null>(null);

    // Load from local first
    useEffect(() => {
        const localStore = localStorage.getItem(STORAGE_KEY);

        if (localStore) {
            const stored: StoredUserData = JSON.parse(localStore);
            if (!userEmail || stored.owner === userEmail) {
                setUserData(stored.data);
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        // This effect handles the transition from anonymous to logged-in
        if (!userEmail || userEmail === 'anonymous') {

            // If user logs out or is anonymous, do nothing here.
            // The logic below will clear data if needed.
            return;
        }

        const token = localStorage.getItem('app_token');
        if (!token) return;

        const handleLoginSync = async () => {
            const localStore = localStorage.getItem(STORAGE_KEY);

            let anonymousData: UserData | null = null;
            if (localStore) {
                const stored: StoredUserData = JSON.parse(localStore);
                if (stored.owner === 'anonymous' && stored.data?.boards?.length > 0) {
                    anonymousData = stored.data;
                }
            }

            try {
                // Always fetch remote data on login
                const res = await fetch('/api/data/sync', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Failed to fetch remote data');

                const remote = await res.json();
                const remoteData: UserData = { boards: remote.data.boards, lastUpdated: new Date(remote.data.lastUpdated).getTime() };

                if (anonymousData && remoteData?.boards?.length > 0) {
                    // CONFLICT DETECTED! We have both anonymous local data and existing remote data.
                    console.log("Conflict detected. Prompting user.");
                    setConflict({ local: anonymousData, remote: remoteData });
                    // We stop here and wait for the user to resolve the conflict.

                    return;
                } else if (anonymousData) {
                    // No remote data, "claim" the anonymous data
                    console.log("No remote data. Migrating local data to new user.");
                    const migratedData = { ...anonymousData, lastUpdated: new Date().getTime() };

                    setUserData(migratedData);
                } else {
                    // No anonymous data, just use the remote data
                    setUserData(remoteData);
                }
            } catch (err) {
                console.error('Error during login sync', err);
                // TODO: maybe show error
            }
        };

        handleLoginSync();

    }, [userEmail]);

    useEffect(() => {
        if (userData && !isLoading) {

            const dataToStore: StoredUserData = {
                data: userData,
                owner: userEmail || 'anonymous'
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        }
    }, [userData, isLoading, userEmail]);


    const addBoard = useCallback((title: string) => {
        const newBoard: Board = {
            id: crypto.randomUUID(),
            title,
            tasks: [], // Start with an empty tasks array
        };

        setUserData(prev => {
            const now = Date.now(); // for timestamp tracking
            if (!prev) {
                return { boards: [newBoard], updatedAt: now };
            }
            return {
                ...prev,
                boards: [...prev.boards, newBoard],
                updatedAt: now
            };
        });

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

    const syncToDatabase = useCallback(async (dataToSync: UserData | null = userData) => {
        const token = localStorage.getItem('app_token');
        if (!userEmail || userEmail === 'anonymous' || !token || !dataToSync) return;

        setIsSyncing(true);
        try {
            const res = await fetch('/api/data/sync', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dataToSync)
            });

            if (!res.ok) throw new Error('Failed to sync to server');
            const { data } = await res.json();
            const syncedData = { boards: data.boards, lastUpdated: new Date(data.lastUpdated).getTime() };

            setUserData(syncedData);
            setConflict(null);

        } catch (err) {
            console.error('Sync failed', err);

        } finally {
            setIsSyncing(false);

        }
    }, [userEmail, userData]);

    const resolveConflictKeepLocal = useCallback(() => {
        if (!conflict) return;

        // Simple merge: combine board arrays. A more sophisticated merge might check for duplicate board names.
        // we are getting dangerously close to git merging procedure
        const mergedBoards = [...conflict.local.boards, ...conflict.remote.boards];
        const mergedData: UserData = {
            boards: mergedBoards,
            lastUpdated: new Date().getTime() // New timestamp for the merge action
        };

        // Set the merged data and then sync it to the server
        setUserData(mergedData);
        syncToDatabase(mergedData);
        setConflict(null);
    }, [conflict, syncToDatabase]);

    const resolveConflictUseServer = useCallback(() => {
        if (!conflict) return;
        // Simply adopt the server's version
        setUserData(conflict.remote);
        setConflict(null);

    }, [conflict]);

    return {
        isLoading,
        boards: userData?.boards ?? [],
        isSyncing,
        conflict,
        getBoard,
        addBoard,
        editBoardName,
        addTask,
        editTask,
        syncToDatabase,
        removeBoard,
        removeTask,
        setTaskPriority,
        resolveConflictKeepLocal,
        resolveConflictUseServer
    };
}