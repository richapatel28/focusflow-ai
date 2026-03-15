import { useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

const useActivityTracker = (sessionId) => {
  const keyboardCount  = useRef(0);
  const mouseCount     = useRef(0);
  const tabSwitchCount = useRef(0);
  const idleDuration   = useRef(0);
  const idleStart      = useRef(null);
  const intervalRef    = useRef(null);
  const idleTimerRef   = useRef(null);
  const isActive       = useRef(false);

  const resetIdleTimer = useCallback(() => {
    // If was idle, count the idle duration
    if (idleStart.current) {
      idleDuration.current += Date.now() - idleStart.current;
      idleStart.current = null;
    }
    clearTimeout(idleTimerRef.current);
    // Start idle after 10 seconds of no activity
    idleTimerRef.current = setTimeout(() => {
      idleStart.current = Date.now();
    }, 10000);
  }, []);

  const sendBatch = useCallback(async () => {
    if (!sessionId) {
      console.log('No sessionId — skipping activity log');
      return;
    }

    // If was idle at time of sending, add remaining idle
    if (idleStart.current) {
      idleDuration.current += Date.now() - idleStart.current;
      idleStart.current = Date.now(); // reset idle start
    }

    const batch = {
      sessionId,
      keyboardCount:  keyboardCount.current,
      mouseCount:     mouseCount.current,
      tabSwitchCount: tabSwitchCount.current,
      idleDurationMs: Math.round(idleDuration.current)
    };

    console.log('Sending activity batch:', batch);

    try {
      const res = await axiosInstance.post('/api/activity/log', batch);
      console.log('Activity log response:', res.data);
    } catch (err) {
      console.error('Activity log error:', err.message);
    }

    // Reset counters
    keyboardCount.current  = 0;
    mouseCount.current     = 0;
    tabSwitchCount.current = 0;
    idleDuration.current   = 0;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      console.log('Activity tracker: no sessionId, not starting');
      return;
    }

    console.log('Activity tracker STARTED for session:', sessionId);
    isActive.current = true;

    const onKeydown = () => {
      keyboardCount.current++;
      resetIdleTimer();
    };

    const onMousemove = () => {
      mouseCount.current++;
      resetIdleTimer();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current++;
        console.log('Tab switch detected! Count:', tabSwitchCount.current);
      }
      resetIdleTimer();
    };

    // Bind events
    document.addEventListener('keydown',          onKeydown);
    document.addEventListener('mousemove',        onMousemove);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Send every 30 seconds
    intervalRef.current = setInterval(() => {
      console.log('30s interval fired — sending batch...');
      sendBatch();
    }, 30000);

    // Start idle timer
    resetIdleTimer();

    return () => {
      console.log('Activity tracker STOPPED');
      isActive.current = false;
      document.removeEventListener('keydown',          onKeydown);
      document.removeEventListener('mousemove',        onMousemove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(intervalRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, [sessionId]);
};

export default useActivityTracker;