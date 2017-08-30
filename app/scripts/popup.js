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

let background = require('background.js');

let exports = module.exports = {};

window.onload = function () {
  document.getElementById('restart').addEventListener('click', restart);
  //TODO maybe its here to put the start of the extension
};

exports.restart = function () {
  let keywordsContainer = document.getElementById('keywords');
  keywordsContainer.innerHTML = '';
  background.start();
};

fillTemplate = function (keywords) {
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
};

notification = function (idP, titleP, messageP) {
  chrome.runtime.sendMessage({
    'idP': idP,
    'titleP': titleP,
    'messageP': messageP,
    'img': '../images/v-128.png'
  }, function () {});
};