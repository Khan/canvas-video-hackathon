/**
 * A clock/timer that supports play, pause, and seek to.
 */
window.Timer = {
  totalMs: 0,

  getMs: function() {
    return this.totalMs;
  },

  start: function() {
    var intervalMs = 10;

    this.interval = setInterval(function() {
      this.totalMs += intervalMs;
    }.bind(this), intervalMs);
  },

  pause: function() {
    clearInterval(this.interval);
    delete this.interval;
  },

  resume: function() {
    if (!this.interval) {
      this.start();
    }
  },

  seekTo: function(timeMs) {
    this.totalMs = timeMs;
  }
};
