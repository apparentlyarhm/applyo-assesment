'use client'

import { jetbrains, nunito } from '@/config/fonts'
import { useUserDataContext } from '@/contexts/user-data-context'
import { Card, Text, Flex, Switch, Box } from '@radix-ui/themes'
import clsx from 'clsx'
import { formatDistanceToNowStrict, isPast } from 'date-fns'
import { EditTaskDialog } from './modals/create-task'
import { Task } from '@/hooks/useUserData'
import { Ellipsis, EllipsisVertical, Pen, Pencil, Trash } from 'lucide-react'

export default function TaskCard(props: Task) {

  const {
    id,
    boardId,
    title,
    description,
    createdAt,
    dueDate,
    status } = props // we de-structure the props

  const isCompleted = status === 'completed'

  if (dueDate) {
    const dueText = formatDistanceToNowStrict(dueDate, { addSuffix: true })
  }

  const { editTask, removeTask } = useUserDataContext()

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? 'pending' : 'completed';
    editTask(boardId, id, { status: newStatus }); // just for toggle
  };

  const handleDelete = () => {
    if (window.confirm(`Yo you sure to remove ` + title)) {
      removeTask(boardId, id)
    }
  }

  return (
    <div className='flex flex-row group'>

      <div className="flex flex-col gap-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        <EditTaskDialog task={props} boardId={boardId}>
          <EllipsisVertical
            size={22}
            className="mt-2 hover:bg-gray-100 p-1 hover:cursor-pointer rounded-xl"
          />
        </EditTaskDialog>

        <Trash
          onClick={handleDelete}
          size={22}
          className="text-red-500 hover:bg-red-100 p-1 hover:cursor-pointer rounded-xl"
        />
      </div>

      <Card size="1" variant="classic" className="w-full min-w-md shadow-none cursor-pointer">


        <Flex direction="column" gap="5">

          <Flex justify="between" align="start" gap='2'>

            <Text as="div" size="3" weight="bold" className={clsx("tracking-tight", nunito.className)}>
              {title}
            </Text>

            <Flex align="center" gap="1">

              <Text size="1" color={isCompleted ? 'green' : 'gray'}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>

              <Switch
                checked={isCompleted}
                variant='soft'
                onCheckedChange={handleStatusToggle}
                color={isCompleted ? 'green' : 'gray'}
              />

            </Flex>
          </Flex>

          {description && (
            <Text size="1" color="gray">
              {description}
            </Text>
          )}

          <Flex justify="between" pt="2" style={{ borderTop: '1px solid var(--gray-a3)' }}>

            <Text size="1" color="gray">
              Created: {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
            </Text>

            {dueDate ? (
              <Text
                size="1"
                color={isPast(dueDate) && !isCompleted ? 'red' : 'gray'}
                weight={isPast(dueDate) && !isCompleted ? 'medium' : 'regular'}
              >
                Due {formatDistanceToNowStrict(dueDate, { addSuffix: true })}
              </Text>
            ) : (
              <Text size="1" color="gray">
                No due date
              </Text>
            )}

          </Flex>
        </Flex>
      </Card>
    </div>
  )
}
