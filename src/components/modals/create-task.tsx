"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addTask, Board } from "@/utils/data-utils";
import { useUserData } from "@/hooks/useUserData";
import { useUserDataContext } from "@/contexts/user-data-context";
import clsx from "clsx";
import { Star } from "lucide-react";
import { nunito } from "@/config/fonts";

interface CreateTaskDialogProps {
    email: string;
    currentBoard: Board; // TODO: improve context to also get this stuff from there.
}

export default function CreateTaskDialog({ email, currentBoard }: CreateTaskDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [priority, setPriority] = useState(false);

    const { addTask } = useUserDataContext();

    const handleSubmit = () => {
        if (!title.trim()) return;

        addTask(currentBoard.id, {
            title: title,
            description: description,
            priority: priority,
            status: 'pending',
            dueDate: dueDate?.toISOString()
        });

        // we reset
        setTitle("");
        setDescription("");
        setDueDate(null);
        setPriority(false);
    };

    return (
        <Dialog.Root>

            <Dialog.Trigger asChild>
                <div className="w-full">
                    <CreateTaskComponent />
                </div>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60" />
                <Dialog.Content className={clsx("fixed top-1/2 left-1/2 w-[95%] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-6 sm:p-8 rounded-xl shadow-2xl", nunito.className)}>
                    <Dialog.Title className="text-xl font-bold text-gray-800">
                        {`New Task for "${currentBoard.title}"`}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-gray-500">
                        Fill in the details below to create a new task.
                    </Dialog.Description>

                    {/* --- Form Container --- */}
                    <div className="mt-6 flex flex-col gap-5">
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="text-sm font-medium text-gray-600">Title</label>
                            <input
                                id="title"
                                type="text"
                                placeholder="e.g., Buy groceries"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label htmlFor="description" className="text-sm font-medium text-gray-600">Description (Optional)</label>
                            <textarea
                                id="description"
                                placeholder="e.g., Milk, bread, and eggs"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Priority Toggle */}
                        <div
                            onClick={() => setPriority(!priority)}
                            className={clsx(
                                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                                priority ? "bg-yellow-100 border-yellow-400" : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                            )}
                        >
                            <Star className={clsx("transition-colors", priority ? "text-yellow-500" : "text-gray-400")} size={20} />
                            <span className={clsx("font-medium", priority ? "text-yellow-800" : "text-gray-600")}>
                                High Priority
                            </span>
                        </div>

                        {/* Due Date Picker */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Due Date</label>
                            <DatePicker
                                selected={dueDate}
                                onChange={(date) => setDueDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholderText="Select a date"
                            />
                        </div>
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="mt-8 flex justify-end gap-3">
                        <Dialog.Close asChild>
                            <button className="px-5 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                            disabled={!title.trim()}
                        >
                            Create Task
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}



export function CreateTaskComponent() {
    return (
        <div
            className="flex justify-center items-center h-48 hover:bg-gray-100 cursor-pointer rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-400">Create or drop tasks here</p>
        </div>
    )
}