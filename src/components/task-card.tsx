'use client'

import { jetbrains, nunito } from '@/config/fonts'
import { useUserDataContext } from '@/contexts/user-data-context'
import { Card, Text, Flex, Switch, Box } from '@radix-ui/themes'
import clsx from 'clsx'
import { formatDistanceToNowStrict, isPast } from 'date-fns'

export type TaskCardProps = {
  isMobile: boolean | null
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
  isMobile,
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
    <Card
      size={isMobile ? '1' : '2'}
      variant="classic"
      className={clsx(
        'w-full min-w-[16rem] hover:bg-gray-200 cursor-pointer shadow-none',
        isMobile ? 'p-3' : 'p-4'
      )}
    >
      <Flex direction="column" gap={isMobile ? '3' : '5'}>
        <Flex justify="between" align="start" gap={isMobile ? '1' : '2'}>
          <Text
            as="div"
            size={isMobile ? '2' : '3'}
            weight="bold"
            className={clsx('tracking-tight', nunito.className)}
          >
            {title}
          </Text>

          <Flex align="center" gap={isMobile ? '1' : '2'}>
            <Text size={isMobile ? '1' : '2'} color={isCompleted ? 'green' : 'gray'}>
              {isCompleted ? 'Completed' : 'Pending'}
            </Text>

            <Switch
              checked={isCompleted}
              onCheckedChange={handleStatusToggle}
              color={isCompleted ? 'green' : 'gray'}
              style={{
                transform: isMobile ? 'scale(0.85)' : 'scale(1)',
                transformOrigin: 'right center',
              }}
            />
          </Flex>
        </Flex>

        {description && (
          <Text size={isMobile ? '1' : '2'} color="gray">
            {description}
          </Text>
        )}

        <Flex
          justify="between"
          pt={isMobile ? '1' : '2'}
          style={{ borderTop: '1px solid var(--gray-a3)' }}
        >
          <Text size={isMobile ? '1' : '2'} color="gray">
            Created: {createdAt}
          </Text>

          {dueDate ? (
            <Text
              size={isMobile ? '1' : '2'}
              color={isPast(dueDate) && !isCompleted ? 'red' : 'gray'}
              weight={isPast(dueDate) && !isCompleted ? 'medium' : 'regular'}
            >
              Due {formatDistanceToNowStrict(dueDate, { addSuffix: true })}
            </Text>
          ) : (
            <Text size={isMobile ? '1' : '2'} color="gray">
              No due date
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}
