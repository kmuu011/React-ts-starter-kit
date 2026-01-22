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
import type { JSX } from 'react'

export interface FilePayload {
  fileName: string
  src: string
  fileSize?: number
  key?: NodeKey
}

export type SerializedFileNode = Spread<
  {
    fileName: string
    src: string
    fileSize?: number
  },
  SerializedLexicalNode
>

export class FileNode extends DecoratorNode<JSX.Element> {
  __src: string
  __fileName: string
  __fileSize?: number

  static getType(): string {
    return 'file'
  }

  static clone(node: FileNode): FileNode {
    return new FileNode(node.__src, node.__fileName, node.__fileSize, node.__key)
  }

  constructor(
    src: string,
    fileName: string,
    fileSize?: number,
    key?: NodeKey
  ) {
    super(key)
    this.__src = src
    this.__fileName = fileName
    this.__fileSize = fileSize
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.file
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

  getFileName(): string {
    return this.__fileName
  }

  getFileSize(): number | undefined {
    return this.__fileSize
  }

  exportJSON(): SerializedFileNode {
    return {
      fileName: this.getFileName(),
      src: this.getSrc(),
      fileSize: this.__fileSize,
      type: 'file',
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedFileNode): FileNode {
    const { fileName, src, fileSize } = serializedNode
    return $createFileNode({
      fileName,
      src,
      fileSize,
    })
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('a')
    element.setAttribute('href', this.__src)
    element.setAttribute('download', this.__fileName)
    element.textContent = this.__fileName
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: HTMLElement) => {
        if (node.hasAttribute('download')) {
          return {
            conversion: convertFileElement,
            priority: 1,
          }
        }
        return null
      },
    }
  }

  decorate(): JSX.Element {
    const { name, extension } = splitFileName(this.__fileName)

    return (
      <a
        href={this.__src}
        download={this.__fileName}
        className="inline-flex items-center gap-2 rounded-base border border-neutral-200 bg-neutral-50 px-3 py-2 my-2 hover:bg-neutral-100 transition-colors"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <svg
          className="h-5 w-5 text-neutral-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <div className="flex flex-col">
          <div className="text-sm font-medium">
            <span>{name}</span>
            <span className="text-neutral-500">{extension}</span>
          </div>
          {this.__fileSize && (
            <span className="text-xs text-neutral-500">
              {formatFileSize(this.__fileSize)}
            </span>
          )}
        </div>
        <svg
          className="h-4 w-4 text-neutral-400 ml-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </a>
    )
  }
}

function convertFileElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLAnchorElement) {
    const { href, download } = domNode
    if (download) {
      const node = $createFileNode({
        fileName: download || 'file',
        src: href
      })
      return { node }
    }
  }
  return null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function splitFileName(fileName: string): { name: string; extension: string } {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return { name: fileName, extension: '' }
  }
  return {
    name: fileName.substring(0, lastDotIndex),
    extension: fileName.substring(lastDotIndex)
  }
}

export function $createFileNode({
  fileName,
  src,
  fileSize,
  key,
}: FilePayload): FileNode {
  return new FileNode(src, fileName, fileSize, key)
}

export function $isFileNode(
  node: LexicalNode | null | undefined
): node is FileNode {
  return node instanceof FileNode
}
