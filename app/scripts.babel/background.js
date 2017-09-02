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

// Default values
const FACEBOOK = 'facebook';
const TWITTER = 'twitter';
const INSTAGRAM = 'instagram';

// Tab states
const COMPLETE = 'complete';

// Default timeout to 20 sec
const TIMEOUT = 7;

let keyWords;
let tabStatuses;

class TabStatus {

  constructor(tabId) {
    this.tabId = tabId;
    this.activated = true;
  }

  isActivated() {
    return this.activated;
  }

  activate() {
    this.activated = true;
  }

  sleep() {
    this.activated = false;
  }
}

class Keyword {

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
  constructor(message) {
    this.message = message;
    this.name = 'SocialKillerException';
  }
}

const initKeywords = () => {
  let facebook = new Keyword(FACEBOOK, TIMEOUT), twitter = new Keyword(TWITTER, TIMEOUT),
    instagram = new Keyword(INSTAGRAM, TIMEOUT);
  keyWords = new Map();
  keyWords.set(FACEBOOK, facebook);
  keyWords.set(TWITTER, twitter);
  keyWords.set(INSTAGRAM, instagram);
}

const start = () => {
  chrome.storage.local.clear(() => {
    let error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
    // Init of default values
    initKeywords();
    chrome.storage.local.set({'social_killer_keywords': keyWords}, () => {
      let error = chrome.runtime.lastError;
      if (error) {
        throw new SocialKillerException('Cannot store any data within your browser:' + error);
      }
      notification('notif1', 'Social Kill Started', 'Facebook, Twitter and Instagram will be killed after 20 seconds.');
    });
  });
}

chrome.tabs.onUpdated.addListener((tabid, info, tab) => {
  if (keyWords && keyWords.size !== 0) {
    killTab(keyWords, tab, info);
  } else {
    chrome.storage.local.get('social_killer_keywords', (entry) => {
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

const checkURL = (keywords, tab) => {
  let keyword;
  keywords.forEach((element) => {
    let k = element.getKeyword();
    if (tab.url.indexOf(k) !== -1) {
      keyword = k;
    }
  });
  return keyword;
}

const killTab = (keywords, tab, info) => {
  // Keywords detection
  let keyword = checkURL(keywords, tab);

  // Tabs status management
  if (!tabStatuses) {
    tabStatuses = new Map();
  }
  let tabStatus = tabStatuses.get(tab.id);

  // Check extension activation
  if (keyword && info.status === COMPLETE) {
    if (!tabStatus) {
      tabStatus = new TabStatus(tab.id);
    } else {
      tabStatus.activate();
    }
    tabStatuses.set(tab.id, tabStatus);
    setTimeout(() => {
      // Check if the tab is loading another page
      if (tabStatuses.get(tab.id) && tabStatuses.get(tab.id).isActivated()) {
        chrome.tabs.remove(tab.id, () => {
          tabStatuses.delete(tab.id);
        });
      }
    }, keywords.get(keyword).getTimeout());
  }
  if (!keyword) {
    if (tabStatus) {
      // Put back extension to sleep
      tabStatus.sleep();
      tabStatuses.set(tab.id, tabStatus);
    }
  }
}

/* Chrome Extension Preset */

chrome.runtime.onMessage.addListener(
  (request) => {
    notification(request.idP, request.titleP, request.messageP);
  }
);

const target = '<all_urls>';
chrome.webRequest.onCompleted.addListener(() => {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, getInfoForTab);
}, {urls: [target]});
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, pageActionOnSK);
});

/* UTILS */

const pageActionOnSK = (tabInfo) => {
  chrome.pageAction.show(tabInfo.id);
}

const getInfoForTab = (tabs) => {
  if (tabs.length > 0) {
    chrome.tabs.get(tabs[0].id, pageActionOnSK);
  }
}

const notification = (idP, titleP, messageP) => {
  chrome.notifications.create(idP, {
    type: 'basic',
    title: titleP,
    message: messageP,
    iconUrl: '../../images/v-128.png'
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}

start();