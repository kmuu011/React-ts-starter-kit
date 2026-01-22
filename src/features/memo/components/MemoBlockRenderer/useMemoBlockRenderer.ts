import type { MemoBlock } from '../../api/memo.api'
import { getFileDownloadUrl, getStaticFileUrl, downloadFileApi } from '../../api/memo.api'

interface UseMemoBlockRendererProps {
  block: MemoBlock
}

export const useMemoBlockRenderer = ({ block }: UseMemoBlockRendererProps) => {
  const getFileInfo = () => {
    // 이미지/비디오는 정적 파일 URL 사용, 일반 파일은 다운로드 API 사용
    const fileCategory = block.file?.fileCategory
    const isImage = fileCategory === 'IMAGE'
    const isVideo = fileCategory === 'VIDEO'

    // 이미지/비디오는 정적 파일 URL, 일반 파일은 다운로드 API URL
    const displayUrl = (isImage || isVideo) && block.file?.fileKey
      ? getStaticFileUrl(block.file.fileKey)
      : block.fileIdx
      ? getFileDownloadUrl(block.fileIdx)
      : null

    const downloadUrl = block.fileIdx ? getFileDownloadUrl(block.fileIdx) : null

    return {
      fileCategory,
      isImage,
      isVideo,
      displayUrl,
      downloadUrl,
    }
  }

  const handleFileDownload = () => {
    if (!block.fileIdx) return

    const fileName = block.file?.fileName && block.file?.fileType
      ? `${block.file.fileName}.${block.file.fileType}`
      : undefined

    downloadFileApi(block.fileIdx, fileName)
  }

  const getFileName = () => {
    if (block.file?.fileName && block.file?.fileType) {
      return `${block.file.fileName}.${block.file.fileType}`
    }
    return '파일 다운로드'
  }

  const getImageStyles = () => ({
    width: block.displayWidth ? `${block.displayWidth}px` : 'auto',
    height: block.displayHeight ? `${block.displayHeight}px` : 'auto',
    maxWidth: '100%',
  })

  const getImageMaxHeight = () => ({
    maxHeight: block.displayHeight ? 'none' : '400px',
  })

  return {
    getFileInfo,
    handleFileDownload,
    getFileName,
    getImageStyles,
    getImageMaxHeight,
  }
}
