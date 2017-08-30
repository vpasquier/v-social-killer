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
 * Background script.
 * @since 1.0
 */

const utils = require('utils.js');

let exports = module.exports = {};

// Default values
const FACEBOOK = 'facebook';
const TWITTER = 'twitter';
const INSTAGRAM = 'instagram';

// Tab states
const COMPLETE = 'complete';

// Default timeout to 20 sec
const TIMEOUT = 20;

let keyWords;

class Keyword {
  // Keyword
  keyword;
  // Timeout in seconds
  timeout;

  constructor(keyword, timeout) {
    this.keyword = keyword;
    this.timeout = timeout;
  }

  getTimeout() {
    if (!this.timeout) {
      return TIMEOUT * 1000;
    }
    return this.timeout * 1000;
  }

  getKeyword() {
    return this.keyword;
  }
}

class SocialKillerException {
  message;
  name;

  constructor(message) {
    this.message = message;
    this.name = 'SocialKillerException';
  }
}

exports.start = function () {
  chrome.storage.local.clear(function () {
    let error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
  // Init of default values
  let facebook = new Keyword(FACEBOOK, TIMEOUT),
      twitter = new Keyword(TWITTER, TIMEOUT),
      instagram = new Keyword(INSTAGRAM, TIMEOUT);
  keyWords = new Map();
  keyWords.set(FACEBOOK, facebook);
  keyWords.set(TWITTER, twitter);
  keyWords.set(INSTAGRAM, instagram);
  chrome.storage.local.set({ 'social_killer_keywords': keyWords }, function () {
    let error = chrome.runtime.lastError;
    if (error) {
      throw new SocialKillerException('Cannot store any data within your browser:' + error);
    }
    utils.notification('notif1', 'Social Kill Started', 'Facebook, Twitter and Instagram will be killed after 20 seconds.');
  });
};

chrome.tabs.onUpdated.addListener(function (tabid, info, tab) {
  if (keyWords.length !== 0) {
    killTab(keyWords, tab, info);
  } else {
    chrome.storage.local.get('social_killer_keywords', function (entry) {
      let error = chrome.runtime.lastError;
      if (error) {
        throw new SocialKillerException('Cannot get any data within your browser:' + error);
      }
      keyWords = entry['social_killer_keywords'];
      if (!keyWords) {
        console.warn('No entries have been found - restarting the extension with default values');
        start();
      }
      killTab(keyWords, tab, info);
    });
  }
});

exports.killTab = function (keywords, tab, info) {
  let keyword;
  keywords.forEach(function (element) {
    if (tab.url.indexOf(element.getKeyword()) !== -1) keyword = element.getKeyword();
  });
  if (keyword && info.status === COMPLETE) {
    // TODO check if in the same tab there is not another URL triggered before the timeout -> skip the killing
    setTimeout(function () {
      chrome.tabs.remove(tab.id, function () {});
    }, keywords.get(keyword).getTimeout());
  }
};

/* Chrome Extension Preset */

chrome.runtime.onMessage.addListener(function (request) {
  utils.notification(request.idP, request.titleP, request.messageP, request.img);
});

const target = '<all_urls>';
chrome.webRequest.onCompleted.addListener(utils.onChange, { urls: [target] });
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, utils.pageActionOnSK);
});