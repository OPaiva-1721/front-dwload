import { useQuery } from '@tanstack/react-query'
import { getMetadata } from '../api/metadataApi'
import { validateDownloadUrl } from '../schemas/download'

export function useMetadata(url: string) {
  return useQuery({
    queryKey: ['metadata', url],
    queryFn: () => getMetadata(url),
    enabled: url.length > 0 && validateDownloadUrl(url) === null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
