import TaskCard from "@/components/task-card";
import { jetbrains, nunito } from "@/config/fonts";
import clsx from "clsx";
import { TextField, Flex, Separator } from "@radix-ui/themes";
import { Search, Pencil, Trash, LogOut, Plus, PlusCircle, CloudCheck, User2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { SortableTaskCard } from "@/components/sortable-task-card";
import { initiateLogin } from "@/utils/auth-utils";


export default function Home() {

  const [user, setUser] = useState<null | { id: string; avatar: string; token: string }>(null); // Keeping it simple

  const [allBoards, setAllBoards] = useState([

  ])

  const [tasks, setTasks] = useState([

  ])
  const [activeTask, setActiveTask] = useState(null); // State for the currently dragged item

  function handleDragStart(event) {
    const { active } = event;
    setActiveTask(tasks.find((task) => task.id === active.id));
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const overContainerId = over.data.current?.sortable.containerId; // Find the container ID of where the item was dropped
      setTasks((currentTasks) => {
        const activeTask = currentTasks.find((task) => task.id === active.id); // Find the dragged task

        if (!activeTask) return currentTasks;

        const newPriority = overContainerId === "priority-column";
        if (activeTask.priority === newPriority) {
          return currentTasks;
        }

        return currentTasks.map((task) =>
          task.id === active.id ? { ...task, priority: newPriority } : task
        );
      });
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("app_token");
    const id = localStorage.getItem("id");
    const avatar = localStorage.getItem("avatar");

    if (token && id && avatar) {
      setUser({ id, avatar, token });
    } else {
      setUser(null);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("app_token");
    localStorage.removeItem("id");
    localStorage.removeItem("avatar");
    setUser(null);
    
    window.location.reload();
  }

  const priorityTasks = tasks.filter((task) => task.priority);
  const nonPriorityTasks = tasks.filter((task) => !task.priority);

  return (
    <div className="flex p-10 gap-5 h-screen w-screen bg-gray-50 items-center text-center justify-center">
      <div className="flex-[4_1_0] border border-gray-200 w-full h-full rounded-3xl bg-white flex flex-col">

        <div className="flex gap-3 px-6 py-6 items-center">
          <p className={clsx("font-extrabold text-3xl text-gray-900", jetbrains.className)}>
            Board Name
          </p>

          <Pencil size={26} className="hover:bg-gray-200 hover:cursor-pointer rounded-md p-1" />

        </div>

        <Separator size="4" />

        {/* DndContext wraps the entire draggable area */}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex flex-1 px-6 py-6 gap-6 overflow-y-auto">
            {/* Priority */}

            {/* SortableContext requires a unique ID and the list of item IDs */}
            <SortableContext id="priority-column" items={priorityTasks.map(t => t.id)}>
              <div className="flex-1 rounded-xl p-4 border border-gray-200">

                <p
                  className={clsx(
                    "font-bold text-lg text-blue-600 mb-4",
                    nunito.className
                  )}
                >
                  Priority
                </p>

                <div className="flex flex-col items-center gap-3">
                  {priorityTasks.length > 0 ? (
                    priorityTasks.map((task) => (
                      <SortableTaskCard key={task.id} {...task} />
                    ))
                  ) : (
                    <CreateTaskComponent />
                  )}
                </div>

              </div>
            </SortableContext>

            {/* Non-priority */}
            <SortableContext id="non-priority-column" items={nonPriorityTasks.map(t => t.id)}>
              <div className="flex-1 rounded-xl p-4 border border-gray-200 ">

                <p
                  className={clsx(
                    "font-bold text-lg text-gray-700 mb-4",
                    nunito.className
                  )}
                >
                  Non-priority
                </p>

                <div className="flex flex-col items-center gap-3">
                  {nonPriorityTasks.length > 0 ? (
                    nonPriorityTasks.map((task) => (
                      <SortableTaskCard key={task.id} {...task} />
                    ))
                  ) : (
                    <CreateTaskComponent />

                  )}
                </div>
              </div>
            </SortableContext>

            <DragOverlay>
              {activeTask ? (
                // Render a non-sortable TaskCard inside the overlay
                // It will now respect its own styling (like max-w-lg)
                // and not be affected by `w-full`
                <TaskCard {...activeTask} />
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>

      {/* All boards div */}
      <div className="flex-[1_1_0] w-full h-full border border-gray-200 rounded-3xl bg-white">
        <div className="flex-1 min-h-[200px] gap-10 px-6 py-8 items-start text-start">
          <p className={clsx("font-extrabold text-xl text-gray-900", jetbrains.className)}>
            Boards
          </p>

          <div className="mt-3">
            {allBoards.map((item) => (
              <div
                key={item.id}
                className="flex justify-between py-2 hover:bg-gray-200 rounded-lg cursor-pointer"
              >
                <p className="px-2 text-sm">{item.title}</p>
                <Trash size={14} className="text-red-400 mr-4" />
              </div>
            ))}
            <div
              onClick={() => alert("create modal")}
              className="flex items-center hover:bg-gray-300 mt-2 justify-center py-2 bg-gray-100 rounded-lg cursor-pointer"
            >
              <PlusCircle size={16} className="text-blue-600" />
              <p className="px-2 text-sm">Create new</p>
            </div>
          </div>

        </div>

        {/* Bottom section: user login status */}
        <div className="border-t border-gray-200 px-6 py-4">
          {user ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user.id}</span>
              </div>
              <button
                onClick={() => handleLogout()}
                className="flex items-center gap-2 text-xs text-red-500 hover:cursor-pointer bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 hover:text-red-600"
              >
                <LogOut size={16} className="mr-1" />
                Log out
              </button>
            </div>
          ) : (
            <div
              onClick={() => initiateLogin()}
              className="flex items-center hover:bg-gray-300 mt-2 justify-center py-2 bg-gray-100 rounded-lg cursor-pointer"
            >
              <User2Icon size={16} className="text-blue-600" />
              <p className="px-2 text-sm">Sign in to save boards and tasks</p>
            </div>

          )}
        </div>

      </div>
    </div>
  );
}

export function CreateTaskComponent() {
  return (
    <div
    onClick={() => alert("create task!")} 
    className="flex justify-center items-center h-48 hover:bg-gray-100 w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300">
      <p className="text-gray-400">Create or drop tasks here</p>
    </div>
  )
}