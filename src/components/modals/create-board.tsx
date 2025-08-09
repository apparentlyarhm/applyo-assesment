"use client";

import { nunito } from "@/config/fonts";
import { useUserDataContext } from "@/contexts/user-data-context";
import { useUserData } from "@/hooks/useUserData";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface CreateBoardDialogProps {
  email: string;
}

export default function CreateBoardDialog({ email }: CreateBoardDialogProps) {
  const [name, setName] = useState("");
  const { addBoard } = useUserDataContext()

  const handleSubmit = () => {
    if (!name.trim()) return;

    addBoard(name.trim())

    // reset
    setName("");
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className={clsx("flex items-center hover:bg-gray-300 mt-2 justify-center py-3 mb-4 bg-gray-100 rounded-lg cursor-pointer", nunito.className)}
        >
          <PlusCircle size={16} className="text-blue-600" />
          <p className="px-2 text-sm">Create new</p>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className={clsx("fixed top-1/2 left-1/2 w-[100%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white py-7 px-5 rounded-lg", nunito.className)}>
          <Dialog.Title className="text-lg font-bold">Create a Board!</Dialog.Title>

          <input
            type="text"
            placeholder="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-4 w-full border rounded-xl px-3 py-4 mb-10"
          />

          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-5 py-3 bg-gray-300 text-sm hover:bg-gray-200 rounded-lg cursor-pointer">Cancel</button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={handleSubmit}
                className="px-5 py-3 bg-blue-600 text-sm text-white rounded-lg cursor-pointer hover:bg-blue-800"
              >
                Create
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
