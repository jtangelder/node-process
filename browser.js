// shim for using process in browser
function noop() {}

module.exports = {
    nextTick: (function () {
        var win = typeof window !== 'undefined' && window;
        var setImmediate = win && win.setImmediate;
        var MutationObserver = win && win.MutationObserver;
        var postMessage = win && win.postMessage;

        if (setImmediate) {
            return function (f) {
                return setImmediate(f)
            };
        }

        var queue = [];

        if (MutationObserver) {
            var hiddenDiv = document.createElement("div");
            var observer = new MutationObserver(function () {
                var queueList = queue.slice();
                queue.length = 0;
                queueList.forEach(function (fn) {
                    fn();
                });
            });

            observer.observe(hiddenDiv, { attributes: true });

            return function nextTick(fn) {
                if (!queue.length) {
                    hiddenDiv.setAttribute('yes', 'no');
                }
                queue.push(fn);
            };
        }

        if (postMessage) {
            var msgData = 'process-tick';
            win.addEventListener('message', function (ev) {
                var source = ev.source;
                if ((source === win || source === null) && ev.data === msgData) {
                    ev.stopPropagation();
                    if (queue.length) {
                        var fn = queue.shift();
                        fn();
                    }
                }
            }, true);

            return function nextTick(fn) {
                queue.push(fn);
                postMessage(msgData, '*');
            };
        }

        return function nextTick(fn) {
            setTimeout(fn, 0);
        };
    })(),

    title: 'browser',
    browser: true,
    env: {},
    argv: [],

    on: noop,
    addListener: noop,
    once: noop,
    off: noop,
    removeListener: noop,
    removeAllListeners: noop,
    emit: noop,

    binding: noop,
    chdir: noop,

    // TODO(shtylman)
    cwd: function () {
        return '/'
    }
};
