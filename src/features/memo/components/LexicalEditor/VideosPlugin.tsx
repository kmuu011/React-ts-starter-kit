import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import type { LexicalCommand } from 'lexical'
import { useEffect, type JSX } from 'react'
import { $createVideoNode } from './VideoNode'
import type { VideoPayload } from './VideoNode'

export type InsertVideoPayload = Readonly<VideoPayload>

export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> = createCommand(
  'INSERT_VIDEO_COMMAND'
)

export default function VideosPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<InsertVideoPayload>(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        const videoNode = $createVideoNode(payload)
        $insertNodes([videoNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}
