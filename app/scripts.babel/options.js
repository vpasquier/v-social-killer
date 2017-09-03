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
 * Options script.
 * @since 1.0
 */

const TIMEOUT = 20;

let keyWords = chrome.extension.getBackgroundPage().keyWords;

const save_options = () => {
  let timeout = document.getElementById('timeout').value;
  if (!timeout || timeout < 0) {
    timeout = TIMEOUT;
  }
  if (!keyWords) {
    chrome.extension.getBackgroundPage().initKeywords();
    keyWords = chrome.extension.getBackgroundPage().keyWords;
  }
  keyWords.forEach((element) => {
    element.setTimeout(timeout);
  });
  chrome.storage.local.set({'social_killer_keywords': keyWords}, () => {
    let status = document.getElementById('status');
    status.textContent = 'Timeout saved to ' + timeout + ' seconds.';
    setTimeout(() => {
      status.textContent = '';
      chrome.extension.getBackgroundPage().notification('notif3', 'Social Kill Started', 'Facebook, Twitter and Instagram will be killed after ' + timeout + ' seconds.');
    }, 5000);
  });
}

window.onload = () => {
  document.getElementById('save').addEventListener('click',
    save_options);
};