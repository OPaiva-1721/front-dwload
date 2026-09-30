import { useQuery } from '@tanstack/react-query'
import { getMetadata } from '../api/metadataApi'
import { validateDownloadUrl } from '../schemas/download'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

// Each metadata call spawns yt-dlp (~3-4s) and counts against the API rate limit (10/min),
// so wait for the URL to settle instead of firing on every keystroke.
export const METADATA_DEBOUNCE_MS = 350

export function useMetadata(url: string) {
  const debouncedUrl = useDebouncedValue(url, METADATA_DEBOUNCE_MS)
  const isValid = url.length > 0 && validateDownloadUrl(url) === null
  const settled = debouncedUrl === url

  const query = useQuery({
    queryKey: ['metadata', debouncedUrl],
    queryFn: () => getMetadata(debouncedUrl),
    enabled: isValid && settled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  return {
    ...query,
    // While the URL is still settling, never expose the previous URL's metadata
    // (it would be sent along with the download request as the wrong title).
    data: settled ? query.data : undefined,
    isLoading: query.isLoading || (isValid && !settled),
  }
}
