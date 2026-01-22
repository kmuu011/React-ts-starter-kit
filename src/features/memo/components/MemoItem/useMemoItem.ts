import { useNavigate } from 'react-router-dom'
import type { Memo, MemoBlock } from '../../api/memo.api'
import { getMemoDetailPath } from '@/app/consts/routerPaths'

interface UseMemoItemProps {
  memo: Memo
  maxPreviewLines?: number
}

export const useMemoItem = ({ memo, maxPreviewLines = 5 }: UseMemoItemProps) => {
  const navigate = useNavigate()

  const sortedBlocks = [...memo.blocks].sort((a, b) => a.orderIndex - b.orderIndex)
  const previewBlocks = sortedBlocks.slice(0, maxPreviewLines)
  const hasMoreBlocks = sortedBlocks.length > maxPreviewLines

  const handleClick = () => {
    navigate(getMemoDetailPath(memo.idx))
  }

  const getFileTypeInfo = (block: MemoBlock) => {
    const fileCategory = block.file?.fileCategory
    const isImage = fileCategory === 'IMAGE'
    const isVideo = fileCategory === 'VIDEO'

    return { isImage, isVideo }
  }

  return {
    previewBlocks,
    hasMoreBlocks,
    handleClick,
    getFileTypeInfo,
  }
}
