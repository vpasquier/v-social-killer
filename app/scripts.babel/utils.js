/*
 Copyright ~ V

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * utils script.
 * @since 1.0
 */

'use strict';

let exports = module.exports = {};

exports.pageActionOnSK = function(tabInfo) {
  chrome.pageAction.show(tabInfo.id);
}

function getInfoForTab(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.get(tabs[0].id, pageActionOnSK);
  }
}

exports.onChange = function () {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, getInfoForTab);
}

exports.notification = function (idP, titleP, messageP, img) {
  chrome.notifications.create(idP, {
    type: 'basic',
    title: titleP,
    message: messageP,
    iconUrl: img
  }, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}
