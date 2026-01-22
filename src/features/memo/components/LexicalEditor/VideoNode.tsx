import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import { DecoratorNode } from 'lexical'
import { useRef, useState, type JSX } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'

export interface VideoPayload {
  src: string
  key?: NodeKey
  width?: number
  height?: number
}

export type SerializedVideoNode = Spread<
  {
    src: string
    width?: number
    height?: number
  },
  SerializedLexicalNode
>

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string
  __width?: number
  __height?: number

  static getType(): string {
    return 'video'
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__width, node.__height, node.__key)
  }

  constructor(
    src: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key)
    this.__src = src
    this.__width = width
    this.__height = height
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.video
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  getSrc(): string {
    return this.__src
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  exportJSON(): SerializedVideoNode {
    return {
      src: this.getSrc(),
      width: this.__width,
      height: this.__height,
      type: 'video',
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { src, width, height } = serializedNode
    return $createVideoNode({
      src,
      width,
      height,
    })
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('video')
    element.setAttribute('src', this.__src)
    element.setAttribute('controls', 'true')
    if (this.__width) {
      element.setAttribute('width', this.__width.toString())
    }
    if (this.__height) {
      element.setAttribute('height', this.__height.toString())
    }
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: () => ({
        conversion: convertVideoElement,
        priority: 0,
      }),
    }
  }

  decorate(): JSX.Element {
    return <VideoComponent nodeKey={this.__key} src={this.__src} width={this.__width} height={this.__height} />
  }
}

function convertVideoElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLVideoElement) {
    const { src } = domNode
    const node = $createVideoNode({ src })
    return { node }
  }
  return null
}

export function $createVideoNode({
  src,
  width,
  height,
  key,
}: VideoPayload): VideoNode {
  return new VideoNode(src, width, height, key)
}

export function $isVideoNode(
  node: LexicalNode | null | undefined
): node is VideoNode {
  return node instanceof VideoNode
}

function VideoComponent({
  nodeKey,
  src,
  width,
  height
}: {
  nodeKey: NodeKey
  src: string
  width?: number
  height?: number
}) {
  const [editor] = useLexicalComposerContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isSelected, setIsSelected] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = videoRef.current?.offsetWidth || 0
    const startHeight = videoRef.current?.offsetHeight || 0

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = startWidth + deltaX
      const aspectRatio = startHeight / startWidth
      const newHeight = newWidth * aspectRatio

      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isVideoNode(node)) {
          node.setWidthAndHeight(Math.round(newWidth), Math.round(newHeight))
        }
      })
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
        margin: '1rem 0',
        cursor: isResizing ? 'nwse-resize' : 'default',
      }}
      onClick={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        controls
        style={{
          maxWidth: '100%',
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          display: 'block',
          outline: isSelected ? '2px solid #3b82f6' : 'none',
        }}
      />
      {isSelected && (
        <div
          onMouseDown={onResizeStart}
          style={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 12,
            height: 12,
            backgroundColor: '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'nwse-resize',
          }}
        />
      )}
    </div>
  )
}
