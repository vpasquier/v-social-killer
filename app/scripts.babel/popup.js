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
  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('save').addEventListener('click', save);
  start();
  // TODO display a message instead of the button
  // TODO fill templates with map values in input text + button save close to restart
};

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

const save = () => {
  let keywordsContainer = document.getElementById('keywords');
  keywordsContainer.innerHTML;
  chrome.extension.getBackgroundPage().keyWords = new Map();
  // TODO tous les put depuis le template container sans validation
  chrome.storage.local.set({'social_killer_keywords': chrome.extension.getBackgroundPage().keyWords}, () => {
    let error = chrome.runtime.lastError;
    if (error) {
      throw new SocialKillerException('Cannot store any data within your browser:' + error);
    }
    chrome.extension.getBackgroundPage().notification('notif1', 'Social Kill', 'Configuration Saved.');
  });
}

const fillTemplate = (keywords) => {
  let keywordItems = [];
  for (let i = 0; i < keywords.length; i++) {
    let email = keywords[i].email;
    let url = keywords[i].url;
    let accountItem = '<div class=pure-u-1-1><h3><a class=pure-button href=' + url + ' target=_blank rel=noreferrer>';
    accountItem = accountItem + email + '</a></h3></div>';
    keywordItems.push(accountItem);
  }
  if (keywordItems.length !== 0) {
    keywordItems.push('<div class=pure-u-1-1><h3><a id=openAll class=pure-button href=#>Open All</a></h3></div>');
  }
  let keywordsContainer = document.getElementById('keywords');
  if (keywordItems.length !== 0) {
    keywordsContainer.insertAdjacentHTML('afterBegin', keywordItems.toString().replace(',', ''));
    document.getElementById('openAll').addEventListener('click', openTabs);
  }
  if (keywordItems.length === 0) {
    keywordsContainer.insertAdjacentHTML('afterBegin', '<div class=pure-u-1-1><h3>Click on Restart</h3></div>');
  }
}