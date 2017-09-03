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
 * Main popup script.
 * @since 1.0
 */

'use strict';

window.onload = () => {
  document.getElementById('reinit').addEventListener('click', restart);
  document.getElementById('option').addEventListener('click', option);
  start();
};

const option = () => {
  chrome.tabs.create({'url': 'chrome://extensions/?options=' + chrome.runtime.id});
}

const start = () => {
  chrome.storage.local.get('social_killer_keywords', (entry) => {
    let error = chrome.runtime.lastError;
    if (error) {
      throw new SocialKillerException('Cannot get any data within your browser:' + error);
    }
    chrome.extension.getBackgroundPage().keyWords = entry['social_killer_keywords'];
    if (Object.keys(chrome.extension.getBackgroundPage().keyWords).length === 0) {
      chrome.extension.getBackgroundPage().globalRestart();
      chrome.extension.getBackgroundPage().notification('notif1', 'Social Kill Started', 'Facebook, Twitter and Instagram will be killed after 15 seconds.');
    }
  });
}

const restart = () => {
  let keywordsContainer = document.getElementById('keywords');
  keywordsContainer.innerHTML = '';
  chrome.extension.getBackgroundPage().globalRestart();
}