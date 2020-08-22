import { useLocation } from 'react-router-dom'

export default function useSearchParams() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  return params
}
