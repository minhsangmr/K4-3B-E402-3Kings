/* TeachBack Mentor · UI session lifecycle helpers */
(function () {
  'use strict';

  function replace(previousState, createState, clearTimer) {
    if (previousState?.timerId != null) clearTimer(previousState.timerId);
    return createState();
  }

  window.TBMSessionState = { replace };
})();
