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

export interface ImagePayload {
  altText: string
  src: string
  key?: NodeKey
  width?: number
  height?: number
}

export type SerializedImageNode = Spread<
  {
    altText: string
    src: string
    width?: number
    height?: number
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width?: number
  __height?: number

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key)
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
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

  getAltText(): string {
    return this.__altText
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      src: this.getSrc(),
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, src, width, height } = serializedNode
    return $createImageNode({
      altText,
      src,
      width,
      height,
    })
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
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
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    }
  }

  decorate(): JSX.Element {
    return <ImageComponent nodeKey={this.__key} src={this.__src} altText={this.__altText} width={this.__width} height={this.__height} />
  }
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src } = domNode
    const node = $createImageNode({ altText, src })
    return { node }
  }
  return null
}

export function $createImageNode({
  altText,
  src,
  width,
  height,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, width, height, key)
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode
}

function ImageComponent({
  nodeKey,
  src,
  altText,
  width,
  height
}: {
  nodeKey: NodeKey
  src: string
  altText: string
  width?: number
  height?: number
}) {
  const [editor] = useLexicalComposerContext()
  const imageRef = useRef<HTMLImageElement>(null)
  const [isSelected, setIsSelected] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = imageRef.current?.offsetWidth || 0
    const startHeight = imageRef.current?.offsetHeight || 0

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = startWidth + deltaX
      const aspectRatio = startHeight / startWidth
      const newHeight = newWidth * aspectRatio

      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isImageNode(node)) {
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
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        style={{
          maxWidth: '100%',
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
          display: 'block',
          outline: isSelected ? '2px solid #3b82f6' : 'none',
        }}
        draggable={false}
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
