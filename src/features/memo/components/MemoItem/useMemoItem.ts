import { useNavigate } from 'react-router-dom'
import type { Memo } from '../../api/memo.api'
import { getMemoDetailPath } from '@/app/consts/routerPaths'

interface UseMemoItemProps {
  memo: Memo
}

export const useMemoItem = ({ memo }: UseMemoItemProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(getMemoDetailPath(memo.idx))
  }

  // content에서 텍스트 미리보기 추출 (줄바꿈 유지, 체크박스 처리)
  const getPreviewData = () => {
    if (!memo.content) return { previewText: '', mediaItems: [] }
    
    try {
      const content = typeof memo.content === 'string' ? JSON.parse(memo.content) : memo.content
      const mediaItems: Array<{ type: 'image' | 'video' | 'file'; index: number }> = []

      // Lexical JSON에서 텍스트 미리보기 추출 (paragraph 구분 유지, 체크박스 처리)
      const extractText = (node: any, parentListType?: string): string => {
        if (!node) return ''
        
        // 이미지, 비디오, 파일 노드 처리 - 마커로 표시 (타입과 인덱스 포함)
        if (node.type === 'image') {
          const index = mediaItems.length
          mediaItems.push({ type: 'image', index })
          return `__MEDIA_IMAGE_${index}__\n`
        }
        if (node.type === 'video') {
          const index = mediaItems.length
          mediaItems.push({ type: 'video', index })
          return `__MEDIA_VIDEO_${index}__\n`
        }
        if (node.type === 'file') {
          const index = mediaItems.length
          mediaItems.push({ type: 'file', index })
          return `__MEDIA_FILE_${index}__\n`
        }
        
        if (node.text) return node.text
        if (node.children) {
          // paragraph나 heading 같은 블록 노드는 줄바꿈으로 구분
          if (node.type === 'paragraph' || node.type === 'heading') {
            const text = node.children.map((child: any) => extractText(child, parentListType)).join('')
            return text + '\n'
          }
          // 리스트 노드 처리
          if (node.type === 'list') {
            const listType = node.listType || parentListType
            return node.children.map((child: any) => extractText(child, listType)).join('')
          }
          // 리스트 아이템 처리 (체크박스 포함)
          if (node.type === 'listitem') {
            const text = node.children.map((child: any) => extractText(child, parentListType)).join('')
            // 체크리스트인지 확인 (listType이 'check'이거나 checked 속성이 있는 경우)
            const isChecklist = parentListType === 'check'
            const isChecked = node.checked === true
            if (isChecklist) {
              const checkbox = isChecked ? '☑ ' : '☐ '
              return checkbox + text + '\n'
            }
            return text + '\n'
          }
          // 일반 children은 그냥 합치기
          return node.children.map((child: any) => extractText(child, parentListType)).join('')
        }
        return ''
      }
      const fullText = extractText(content.root)
      // 최대 3줄까지만 (줄바꿈 기준으로 자르기)
      const lines = fullText.split('\n').filter(line => line.trim())
      const previewText = lines.slice(0, 3).join('\n')
      
      return { previewText, mediaItems }
    } catch {
      return { previewText: '', mediaItems: [] }
    }
  }

  const { previewText, mediaItems } = getPreviewData()

  return {
    previewText,
    mediaItems,
    handleClick,
  }
}
