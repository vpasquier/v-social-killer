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
const TIMEOUT = 20;

let keyWords;

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

const start = () => {
  chrome.storage.local.clear(() => {
    let error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
    // Init of default values
    let facebook = new Keyword(FACEBOOK, TIMEOUT), twitter = new Keyword(TWITTER, TIMEOUT),
      instagram = new Keyword(INSTAGRAM, TIMEOUT);
    keyWords = new Map();
    keyWords.set(FACEBOOK, facebook);
    keyWords.set(TWITTER, twitter);
    keyWords.set(INSTAGRAM, instagram);
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

const killTab = (keywords, tab, info) => {
  let keyword;
  keywords.forEach((element) => {
    let k = element.getKeyword();
    if (tab.url.indexOf(k) !== -1) {
      keyword = k;
    }
  });
  if (keyword && info.status === COMPLETE) {
    // TODO check if in the same tab there is not another URL triggered before the timeout -> skip the killing
    setTimeout(() => {
      chrome.tabs.remove(tab.id, () => {
      });
    }, keywords.get(keyword).getTimeout());
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
