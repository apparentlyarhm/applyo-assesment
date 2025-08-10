'use client'

import { jetbrains, nunito } from '@/config/fonts'
import { useUserDataContext } from '@/contexts/user-data-context'
import { Card, Text, Flex, Switch, Box } from '@radix-ui/themes'
import clsx from 'clsx'
import { formatDistanceToNowStrict, isPast } from 'date-fns'

export type TaskCardProps = {
  id: string;
  boardId: string;
  title: string
  description?: string
  createdAt: string
  dueDate: Date | string | null
  status: 'pending' | 'completed'
}

export default function TaskCard({
  id,
  boardId,
  title,
  description,
  createdAt,
  dueDate,
  status,
}: TaskCardProps) {
  const isCompleted = status === 'completed'

  if (dueDate){
    const dueText = formatDistanceToNowStrict(dueDate, { addSuffix: true })
  }

  const { editTask } = useUserDataContext()

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? 'pending' : 'completed';
    editTask(boardId, id, { status: newStatus });
  };

  return (
    <Card size="1" variant="classic" className="w-full min-w-md hover:bg-gray-200 cursor-pointer shadow-none">
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
  )
}
