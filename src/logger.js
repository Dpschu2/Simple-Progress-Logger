/**
 * @class Logger
 * @author Dean Schulz
 * @description A simple logger class for displaying progress bars, loading animations, and ETA in the terminal.
 * @param {Object} options - Configuration options for the logger.
 *    default options: {
 *      message: '',                // message to display alongside the progress bar or animation.
 *      total: null,                // total value for determinate progress bars. If null or undefined, shows indeterminate animation.
 *      value: 0,                   // initial value of progress
 *      showProgressBar: true,      // whether to display a progress bar (for determinate mode)
 *      showLoadingAnimation: true, // whether to display a loading animation (for indeterminate mode)
 *      showEta: true,              // whether to display estimated time remaining (for determinate mode)
 *      barLength: 10               // the length of the progress bar or animation.
 *      updateThrottle: 50          // the time in milliseconds to update the progress bar.
 *      showAvgTimePerItem: false   // whether to display average time per item when stopping the logger.
 *      fullCharacter: '\u2588',    // the character to use for the filled part of the progress bar.
 *      emptyCharacter: '\u2591',   // the character to use for the empty part of the progress bar.
 *      displayMessageFirst: false  // whether to display the message first before the progress/loading animation bar.
 *    }
 *
 * @example
 * // Basic usage with a progress bar
 * const Logger = require('simple-progress-logger');
 * const totalSize = 100;
 * const logger = new Logger({ message: 'Running processes...', total: totalSize });
 * for (let i = 0; i <= totalSize; i++) {
 *   logger.update('Processing...', i);
 *   await new Promise(r => setTimeout(r, 50));
 * }
 * logger.stop('Done!');
 *
 * @example
 * // Indeterminate loading animation
 * const Logger = require('simple-progress-logger');
 * const logger = new Logger({ message: 'Processing...' });
 * setTimeout(() => logger.stop('Done!'), 3000);
 */

const readline = require('readline');
class Logger {
  constructor(options = {}) {
    this.message = options.message ?? '';
    this.value = options.value ?? 0;
    this.total = options.total ?? null;
    this.indeterminate = this.total === null;
    this.showProgressBar = options.showProgressBar ?? true;
    this.showLoadingAnimation = options.showLoadingAnimation ?? true;
    this.showEta = options.showEta ?? true;
    this.barLength = options.barLength ?? 10;
    this.updateThrottle = options.updateThrottle ?? 50;
    this.showAvgTimePerItem = options.showAvgTimePerItem ?? false;
    this.fullCharacter = options.fullCharacter ?? '\u2588';
    this.emptyCharacter = options.emptyCharacter ?? '\u2591';
    this.displayMessageFirst = options.displayMessageFirst ?? false;

    this.timer = null;
    this.bar = null;
    this.startTime = Date.now();
    this.isActive = false;
    this.originalConsoleLog = null;
    this.originalConsoleWarn = null;
    this.originalConsoleError = null;
    this.outputBuffer = [];
    this.progressLine = '';
    this.frameIndex = 0;
    this.lastProgressUpdate = 0;
    this.timer = null;

    // Back and Forward Loading Animation
    this.frames = [];
    for (let i = 0; i < this.barLength; i++) {
      let frame = '';
      for (let j = 0; j < this.barLength; j++) {
        frame += (i === j) ? this.fullCharacter : this.emptyCharacter;
      }
      this.frames.push(frame);
    }
    for (let i = this.barLength - 2; i > 0; i--) {
      let frame = '';
      for (let j = 0; j < this.barLength; j++) {
        frame += (i === j) ? this.fullCharacter : this.emptyCharacter;
      }
      this.frames.push(frame);
    }
    
    if (!this.indeterminate) {
      this.isActive = true;
    }
    this.startAnimation();
    this.interceptConsole();
    if (!this.indeterminate) {
      this.updateProgress();
    }
  }
  getProgressBar() {
    const progress = this.value / this.total;
    const filledLength = Math.floor(progress * this.barLength);
    const emptyLength = this.barLength - filledLength;
    const bar = `${"\u2588".repeat(filledLength)}${"\u2591".repeat(emptyLength)}`;
    return bar;
  }
  startAnimation() {
    this.timer = setInterval(() => {
      const loadingAnimation = this.showLoadingAnimation ? `${this.frames[this.frameIndex]} ` : '';
      if (this.indeterminate) {
        this.progressLine = `\r${loadingAnimation}${this.message}`;
      } else {
        const percentage = Math.round((this.value / this.total) * 100);
        const progressBar = this.showProgressBar ? `${this.getProgressBar()} ` : '';
        const etaText = this.showEta ? ` | ETA: ${this.calculateETA()} ` : '';
        this.progressLine = `\r${this.displayMessageFirst ? `${this.message} | ` : ''}${this.showProgressBar ? progressBar : loadingAnimation}${percentage}% | ${this.value}/${this.total}${etaText}${!this.displayMessageFirst ? ` | ${this.message}` : ''}`;
      }
      this.displayProgress();
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, this.updateThrottle);
  }
  stopAnimation(message = '') {
    clearInterval(this.timer);
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${message}\n`);
  }

  updateProgress() {
    if (!this.isActive) return;
    const now = Date.now();
    if (now - this.lastProgressUpdate < this.updateThrottle) {
      return;
    }
    this.lastProgressUpdate = now;
  }

  displayProgress() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(this.progressLine);
  }

  calculateETA() {
    if (this.value === 0) {
      return 'Calculating...';
    }
    const elapsed = Date.now() - this.startTime;
    const avgTimePerItem = elapsed / this.value;
    const totalEstimatedTime = avgTimePerItem * this.total;
    
    const completionTime = this.startTime + totalEstimatedTime;
    const now = Date.now();
    const timeUntilCompletion = completionTime - now;
    
    const totalSeconds = Math.round(timeUntilCompletion / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  interceptConsole() {
    // Store original console methods
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;
    
    // Intercept console.log
    console.log = (...args) => {
      const message = args.join(' ');
      this.outputBuffer.push(message);
      
      // Show the message and then the progress bar
      this.progressLine = `\r${message}\n`;
      if (this.isActive) {
        this.displayProgress();
      }
    };
    
    // Intercept console.warn
    console.warn = (...args) => {
      const message = '\u26A0\uFE0F  ' + args.join(' ');
      this.outputBuffer.push(message);
      
      this.progressLine = `\r${message}\n`;
      if (this.isActive) {
        this.displayProgress();
      }
    };
    
    // Intercept console.error
    console.error = (...args) => {
      const message = '\u274C ' + args.join(' ');
      this.outputBuffer.push(message);
      
      this.progressLine = `\r${message}\n`;
      if (this.isActive) {
        this.displayProgress();
      }
    };
  }

  increment() {
    if (!this.indeterminate && this.isActive) {
      this.value++;
      this.updateProgress();
    }
    return this;
  }

  update(message = '', value = null) {
    if (value !== null) {
      this.value = value;
    }
    if (message) {
      this.message = message;
    }
    if (!this.indeterminate && this.isActive) {
      this.updateProgress();
    }
    return this;
  }

  stop(endMessage = '') {
    if (this.indeterminate) {
      this.stopAnimation();
    } else {
      if (endMessage) {
        this.message = endMessage;
      }
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      const avgTimePerItem = this.value > 0 ? (Date.now() - this.startTime) / this.value : 0;
      const avgTimePerItemSeconds = (avgTimePerItem / 1000).toFixed(2);
      this.stopAnimation(`${this.message} | ${elapsed}s total${this.showAvgTimePerItem ? ` | ${avgTimePerItemSeconds}s avg per item` : ''}`);
    }
    this.restoreConsole();
  }

  restoreConsole() {
    if (this.originalConsoleLog) {
      console.log = this.originalConsoleLog;
      console.warn = this.originalConsoleWarn;
      console.error = this.originalConsoleError;
    }
  }
}

module.exports = { Logger };