'use client'

import { jetbrains, nunito } from '@/config/fonts'
import { Card, Text, Flex, Switch, Box } from '@radix-ui/themes'
import clsx from 'clsx'
import { formatDistanceToNowStrict, isPast } from 'date-fns'
import { CheckCircle, Circle } from 'lucide-react'

type TaskCardProps = {
  title: string
  description?: string
  createdAt: Date
  dueDate: Date
  status: 'pending' | 'completed'
  onStatusToggle: () => void
}

export default function TaskCard({
  title,
  description,
  createdAt,
  dueDate,
  status,
  onStatusToggle
}: TaskCardProps) {
  const isCompleted = status === 'completed'
  const dueText = formatDistanceToNowStrict(dueDate, { addSuffix: true })

  return (
    <Card size="1" variant="classic" className="w-full border-0.5 border-gray-200 min-w-md transition-shadow hover:shadow-md cursor-grab">
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
              onCheckedChange={onStatusToggle}
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
            Created: {createdAt.toLocaleDateString()}
          </Text>

          <Text
            size="1"
            color={isPast(dueDate) && !isCompleted ? 'red' : 'gray'}
            weight={isPast(dueDate) && !isCompleted ? 'medium' : 'regular'}
          >
            Due {dueText}
          </Text>

        </Flex>
      </Flex>
    </Card>
  )
}
