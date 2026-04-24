import { useMutation } from '@tanstack/react-query'
import { createDownload } from '../api/downloadsApi'
import type { DownloadRequest } from '../schemas/download'

export function useCreateDownload() {
  return useMutation({
    mutationFn: (req: DownloadRequest) => createDownload(req),
  })
}
