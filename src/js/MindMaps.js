/*!
 *  mindmaps - a HTML5 powered mind mapping application
 *  Copyright (C) 2011  David Richard
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Make sure this is the first file to be referenced in index.hml.
 */

// Use ECMA5 strict mode. see:
// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

/**
 * @namespace Application wide namespace for mindmaps.
 */
var mindmaps = mindmaps || {};
mindmaps.VERSION = "0.7.2";


// experimental app cache invalidator. from:
// http://www.html5rocks.com/en/tutorials/appcache/beginner/#toc-updating-cache/
// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      window.applicationCache.swapCache();
      window.onbeforeunload = null;
      if (confirm('A new version of the app is available. Load it?')) {
        window.location.reload();
      }
    } else {
      // Manifest didn't changed. Nothing new to server.
    }
  }, false);

}, false)

/**
 * Start up. This function is executed when the DOM is loaded.
 */
$(function() {
  trackErrors();

  if (!mindmaps.DEBUG) {
    // addUnloadHook();
  }
});

/**
* Adds a confirmation dialog when the user navigates away from the app.
*/
function addUnloadHook () {
  window.onbeforeunload = function (e) {
    var msg = "Are you sure? Any unsaved progress will be lost."
    e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
      e.returnValue = msg;
    }

    // For Safari
    return msg;
  };
}


function trackErrors() {
  window.onerror = function(msg, url, line) {
    if (!window.gtag) {
      return;
    }

    // Track JS errors in GA.
    gtag('event', msg, {
      event_category: 'Error Log',
      event_label: msg,
      value: url + '_' + line
    });

    return false; // false prevents default error handling.
  };
}

// warum sind manche leute nur so drauf...
$(function() {
  $("#bottombar table").remove();
  $("input[name='hosted_button_id']").val("123");
});
