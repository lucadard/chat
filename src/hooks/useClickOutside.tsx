import React, { useRef, useEffect } from 'react'

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useClickOutside (ref: React.MutableRefObject<any>, active: boolean, callback: () => void) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    if (!active) return
    function handleClickOutside (event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', (handleClickOutside))
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, active])
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideAlerter ({ active, children, callback }: { active: boolean, children: React.ReactNode, callback: () => void }) {
  const wrapperRef = useRef(null)
  useClickOutside(wrapperRef, active, callback)

  return <div ref={wrapperRef}>{children}</div>
}
