import { jetbrains, nunito } from "@/config/fonts";
import clsx from "clsx";
import { Separator } from "@radix-ui/themes";
import { Pencil, Trash, LogOut, Plus, PlusCircle, CloudCheck, User2Icon, PlusSquareIcon, CloudUploadIcon, Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SortableTaskCard } from "@/components/sortable-task-card";
import { initiateLogin } from "@/utils/auth-utils";
import CreateTaskDialog from "@/components/modals/create-task";
import CreateBoardDialog from "@/components/modals/create-board";
import { useUserDataContext } from "@/contexts/user-data-context";
import { useAuth } from "@/contexts/auth-context";
import { Task } from "@/hooks/useUserData";

export default function Home() {
  const { user, logout } = useAuth()

  const {
    boards,
    removeBoard,
    editBoardName
  } = useUserDataContext()

  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId),
    [boards, activeBoardId]
  );

  const tasks = activeBoard?.tasks ?? [];

  // TODO: fix
  const [activeTask, setActiveTask] = useState<Task | undefined | null>(null); // State for the currently dragged item

  useEffect(() => {
    if (!activeBoardId && boards.length > 0) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  const handleDeleteBoard = (boardIdToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this board and all its tasks?")) {
      if (activeBoardId === boardIdToDelete) {
        setActiveBoardId(null); // perhaps next available board?
      }
      removeBoard(boardIdToDelete);
    }
  };

  const priorityTasks = tasks.filter((task) => task.priority);
  const nonPriorityTasks = tasks.filter((task) => !task.priority);

  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editedBoardName, setEditedBoardName] = useState("");

  const handleStartEdit = () => {
    if (!activeBoard) return;
    setEditedBoardName(activeBoard.title); // Pre-fill the input with the current name
    setIsEditingBoardName(true);
  };

  const handleSaveEdit = () => {
    if (!activeBoard) return;
    editBoardName(activeBoard.id, editedBoardName);
    setIsEditingBoardName(false); 
  };

  const handleCancelEdit = () => {
    setIsEditingBoardName(false);
  };

  return (
    <div className="flex p-10 gap-5 h-screen w-screen bg-gray-50 items-center text-center justify-center">
      <div className="flex-[4_1_0] border border-gray-200 w-full h-full rounded-3xl bg-white flex flex-col">

        <div className={clsx("flex gap-3 px-6 py-6 items-center", jetbrains.className)}>
          {isEditingBoardName ? (
            // --- EDITING VIEW ---
            <>
              <input
                type="text"
                value={editedBoardName}
                onChange={(e) => setEditedBoardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="font-extrabold text-2xl text-gray-900 border-1 border-gray-200 rounded-xl py-3 px-4 outline-none"
                autoFocus
              />
              <button onClick={handleSaveEdit} className="p-1 rounded-md hover:bg-green-100 hover:cursor-pointer"><Check className="text-green-600" size={20} /></button>
              <button onClick={handleCancelEdit} className="p-1 rounded-md hover:bg-red-100 hover:cursor-pointer"><X className="text-red-600" size={20} /></button>
            </>
          ) : (
            <>
              <p className="font-extrabold text-3xl py-3 pl-4  text-gray-900">
                {activeBoard ? activeBoard.title : "Select a Board"}
              </p>
              {activeBoard && (
                <button onClick={handleStartEdit} className="hover:bg-gray-200 hover:cursor-pointer rounded-md p-1">
                  <Pencil size={18} />
                </button>
              )}
            </>
          )}
        </div>

        <Separator size="4" />

        {activeBoard ? (
          <>
            {/* DndContext wraps the entire draggable area */}
            <div className="flex flex-1 px-6 py-6 gap-6 h-[calc(80vh-48px)]">

              {/* Priority */}
              <div className="flex-1 rounded-xl p-4 border border-gray-200 flex flex-col">
                <p
                  className={clsx(
                    "font-bold text-lg text-blue-600 mb-4",
                    nunito.className
                  )}
                >
                  Priority
                </p>

                <div className="flex flex-col items-center gap-3 overflow-y-auto flex-1">
                  {priorityTasks.length > 0 ? (
                    priorityTasks.map((task) => (
                      <SortableTaskCard key={task.id} {...task} boardId={activeBoard.id} />
                    ))
                  ) : (
                    <CreateTaskDialog email={user ? user.id : "anonymous"} currentBoard={activeBoard} />
                  )}
                </div>
              </div>

              {/* Non-priority */}
              <div className="flex-1 rounded-xl p-4 border border-gray-200 flex flex-col">
                <p
                  className={clsx(
                    "font-bold text-lg text-gray-700 mb-4",
                    nunito.className
                  )}
                >
                  Non-priority
                </p>

                <div className="flex flex-col items-center gap-3 overflow-y-auto flex-1">
                  {nonPriorityTasks.length > 0 ? (
                    nonPriorityTasks.map((task) => (
                      <SortableTaskCard key={task.id} {...task} />
                    ))
                  ) : (
                    <CreateTaskDialog email={user ? user.id : "anonymous"} currentBoard={activeBoard} />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (

          <div className="flex flex-col gap-6 items-center text-center justify-center h-full w-full">
            <img src={"/svgs/tasks.svg"} className="h-13 w-13 opacity-25" />

            <p className={clsx("text-gray-500 text-sm italic", jetbrains.className)}>
              Select a board to view tasks!
            </p>

          </div>

        )}
      </div>


      <div className="flex flex-col flex-[1_1_0] w-full h-full border border-gray-200 rounded-3xl bg-white overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0 p-6">

          <p className={clsx("font-extrabold text-xl text-gray-900", jetbrains.className)}>
            Boards
          </p>

          <div className="mt-3 flex-1 overflow-y-auto -mx-2">
            <CreateBoardDialog email={user ? user.id : "anonymous"} />
          </div>

          {boards.map((item) => (
            <div
              onClick={() => setActiveBoardId(item.id)}
              key={item.id}
              className={clsx("flex justify-between items-center py-4 px-2 hover:bg-gray-200 rounded-lg cursor-pointer", nunito.className)}
            >
              <p className="text-md tracking-tight">{item.title}</p>
              <Trash onClick={() => handleDeleteBoard(item.id)} size={26} className="p-1 text-red-400 hover:bg-red-100 rounded-xl" />
            </div>
          ))}

        </div>


        <div className="border-t border-gray-200 px-6 py-4">
          {user ? (
            <div className="flex justify-around items-center">

              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">

                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full"
                  />

                  <span className="text-xs font-medium text-gray-700">{user.id}</span>

                </div>


              </div>

              <Separator orientation={"vertical"} size={"3"} />

              <div className="flex flex-col gap-5">
                <button
                  onClick={() => alert("coming soon!")}
                  className="flex items-center gap-2 text-xs text-blue-500 hover:cursor-pointer bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 hover:blue-red-600"
                >
                  <CloudUploadIcon size={16} />
                  Sync to cloud
                </button>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-xs text-red-500 hover:cursor-pointer bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 hover:text-red-600"
                >
                  <LogOut size={16} className="mr-1" />
                  Log out
                </button>
                
              </div>

            </div>
          ) : (

            <div
              onClick={() => initiateLogin()}
              className="flex items-center hover:bg-gray-300 justify-center py-4 bg-gray-100 rounded-lg cursor-pointer"
            >
              <User2Icon size={16} className="text-blue-600" />
              <p className={clsx("px-2 text-sm", nunito.className)}>Sign in to save boards and tasks</p>
            </div>


          )}
        </div>

      </div>
    </div >

  );
}