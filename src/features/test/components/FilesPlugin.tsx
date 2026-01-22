import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import type { LexicalCommand } from 'lexical'
import { useEffect, type JSX } from 'react'
import { $createFileNode } from './FileNode'
import type { FilePayload } from './FileNode'

export type InsertFilePayload = Readonly<FilePayload>

export const INSERT_FILE_COMMAND: LexicalCommand<InsertFilePayload> = createCommand(
  'INSERT_FILE_COMMAND'
)

export default function FilesPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<InsertFilePayload>(
      INSERT_FILE_COMMAND,
      (payload) => {
        const fileNode = $createFileNode(payload)
        $insertNodes([fileNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}
