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
 * Global script.
 * @since 1.0
 */

const FACEBOOK = 'facebook';
const TWITTER = 'twitter';
const INSTAGRAM = 'instagram';

const TIMEOUT = 5;

let keyWords;

const initKeywords = () => {
  let facebook = new Keyword(FACEBOOK, TIMEOUT), twitter = new Keyword(TWITTER, TIMEOUT),
    instagram = new Keyword(INSTAGRAM, TIMEOUT);
  keyWords = new Map();
  keyWords.set(FACEBOOK, facebook);
  keyWords.set(TWITTER, twitter);
  keyWords.set(INSTAGRAM, instagram);
}

const globalRestart = () => {
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
    });
  });
}
