// Credit: https://gist.github.com/jezhou/

// Trello API constants
const TRELLO_API_KEY = '[TRELLO API KEY]';
const TRELLO_API_TOKEN = '[TRELLO API TOKEN]';
const REQUEST_BOARD_ID = '[ID FOR THE TRELLO BOARD]';
const REQUEST_NEW_CARD_LIST_ID = '[ID FOR THE LIST IN WHICH TO PUT THE CARD]';
const REQUEST_LABEL_CACHE_ID = 'request-label-cache';

// Fire off this function in the script editor to enable.
function init() {
  var triggers = ScriptApp.getProjectTriggers();
  var form = FormApp.getActiveForm();

  // Delete all triggers before making a brand new one.
  //for(var i in triggers) {
  //  ScriptApp.deleteTrigger(triggers[i]);
  //}

  // Set up a new trigger
  ScriptApp.newTrigger('submitToTrello').forForm(form).onFormSubmit().create();

  Logger.log('Successful creation of new submitToTrello trigger.');
}

// lazy load a mapping of label names to ids
function getLabelIdsNamesMap() {
  var cache = CacheService.getScriptCache();

  // uncomment to disable cache
  // cache.remove(REQUEST_LABEL_CACHE_ID);

  var cached = cache.get(REQUEST_LABEL_CACHE_ID);
  if (cached != null) {
    return JSON.parse(cached);
  }

  var url =
    'https://api.trello.com/1/board/' +
    REQUEST_BOARD_ID +
    '/labels' +
    '?key=' +
    TRELLO_API_KEY +
    '&token=' +
    TRELLO_API_TOKEN;

  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  var labelIdsNamesMap = data.reduce((curr, l) => {
    curr[l.name] = l;
    return curr;
  }, {});
  // cache for 10 minutes
  cache.put(REQUEST_LABEL_CACHE_ID, JSON.stringify(labelIdsNamesMap), 600);
  return labelIdsNamesMap;
}

function createCard(name, description, labels) {
  var labelIdsNamesMap = getLabelIdsNamesMap();
  Logger.log('create card', { name, description });
  // https://developer.atlassian.com/cloud/trello/rest/#api-cards-post
  var formData = {
    key: TRELLO_API_KEY,
    token: TRELLO_API_TOKEN,
    name: name,
    desc: description,
    pos: 'bottom',
    idList: REQUEST_NEW_CARD_LIST_ID,
    idLabels: labels
      ? labels
          .filter((l) => labelIdsNamesMap[l]) // only labels that exist in the board
          .map((l) => labelIdsNamesMap[l].id) // get id from label
          .join(',')
      : null, // comma separated
  };

  Logger.log('form data', formData);

  var url = 'https://api.trello.com/1/cards';

  var options = {
    method: 'post',
    payload: formData,
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log('create card - response', response);
}

var cardFieldTitles = {
  money: '##Money Requests##',
  supplies: '##Supplies/Errands##',
  childcare: '##Childcare & Petcare##',
  emotional: '##Emotional/Spiritual Support##',
  resources: '##Resources##',
  other: '##Other##',
};

var cardLabels = {
  money: ['$$$'],
  supplies: ['Supplies/Errands'],
  childcare: ['Childcare/Petcare'],
  emotional: ['Emotional/Spiritual'],
  resources: ['Resources'],
  other: [],
};

var cardStartHeaders = {
  'Do you need financial resources?': 'money',
  'Do you need help getting supplies or running errands?': 'supplies',
  'Are you looking for in person childcare and/or online activities for kids and/or petcare?':
    'childcare',
  'Are you looking for emotional or spiritual support?': 'emotional',
  'Do you need resource support, or support with anything not on this form already?':
    'resources',
  'Anything about yourself you’d like to share (zero expectation if you’d rather not)':
    'other',
};

const cardTypeEnabled = {
  money: true,
  supplies: true,
  childcare: true,
  emotional: true,
  resources: true,
  other: false,
};

var cardStartHeaderKeys = Object.keys(cardStartHeaders);

var defaultLabels = ['English'];

function processCard(i, body, cardType, latestItemResponses, labels, subject) {
  var localBody = body.slice(0);
  localBody = localBody.concat(cardFieldTitles[cardType] + '\n');
  let currentTitle = latestItemResponses[i].getItem().getTitle();
  const responseCount = latestItemResponses.length;
  let count = 0;
  do {
    count++;
    var formatted = Utilities.formatString(
      '**%s**\n %s\n\n',
      currentTitle,
      latestItemResponses[i].getResponse()
    );
    formatted = formatted.concat('\n');
    localBody = localBody.concat(formatted);
    currentTitle = latestItemResponses[++i].getItem().getTitle();
  } while (
    // keep looking for the next header or the end of the data
    cardStartHeaders[currentTitle] === undefined &&
    i < responseCount - 1
  );

  createCard(subject, localBody, [...defaultLabels, labels]);
  return count;
}

function parseLatestItemResponses(latestItemResponses, i, body, subject) {
  const headerTitle = latestItemResponses[i].getItem().getTitle();
  const response = latestItemResponses[i].getResponse();
  for (const cardStartHeaderKey of cardStartHeaderKeys) {
    if (headerTitle == cardStartHeaderKey && response == 'Yes') {
      const cardType = cardStartHeaders[cardStartHeaderKey];
      if (!cardType) {
        throw new Error(`Missing cardType ${cardType}`);
      }

      if (cardTypeEnabled[cardType] !== true) {
        // we don't parse a card for the 'other'
        Logger.log('Skipping parsing because this card type is not enabled');
        continue;
      }

      return processCard(
        i,
        body,
        cardType,
        latestItemResponses,
        cardLabels[cardType],
        subject
      );
    }
  }
  // when nothing could be processed advance to the next row
  return 1;
}

function submitToTrello(e) {
  var form = FormApp.getActiveForm();
  var latestItem = form.getResponses().pop();
  var timestamp = latestItem.getTimestamp(); // get the timestamp for later in the description
  var latestItemResponses = latestItem.getItemResponses();

  // Subject line will be the title of the event on Trello card
  // subject is: [name] + [pronouns] + [city]
  var subject =
    latestItemResponses[1].getResponse() +
    ' (' +
    latestItemResponses[3].getResponse() +
    '), ' +
    latestItemResponses[4].getResponse();
  // This is the beginning of the description in trello. Later we'll add request details.
  // To start, we add contact info, neighborhood if desired, and degree of comfort sharing the need
  var body = '';
  var timeString = Utilities.formatDate(
    timestamp,
    'EST',
    'EEE, d MMM yyyy HH:mm:ss z'
  ); // format the timestamp for the description
  body = body.concat(
    Utilities.formatString(
      '**Timestamp:** %s\n**Language Preference:** %s\n**I am filling this out:** %s\n**Contact Info:** %s\n',
      timeString,
      latestItemResponses[2].getResponse(),
      latestItemResponses[0].getResponse(),
      latestItemResponses[6].getResponse()
    )
  );

  // add neighborhood if the person is a "yes" or a "maybe" for getting connected
  if (latestItemResponses[7].getResponse() != 'No') {
    body = body.concat(
      Utilities.formatString(
        '**Connect to neighborhood?** %s\n**Neighborhood:** %s\n',
        latestItemResponses[7].getResponse(),
        latestItemResponses[8].getResponse()
      )
    );
  }

  // add the details that are collected at the end of the form – personal info, sharing desire
  var responseLength = latestItemResponses.length;
  body = body.concat(
    Utilities.formatString(
      '**Personal info:** %s\n**Level of sharing I am ok with:** %s\n**What information I am ok with sharing:** %s\n**Follow up about supporting others:** %s\n\n',
      latestItemResponses[responseLength - 4].getResponse(),
      latestItemResponses[responseLength - 3].getResponse(),
      latestItemResponses[responseLength - 2].getResponse(),
      latestItemResponses[responseLength - 1].getResponse()
    )
  );

  // add labels and descriptions based on what type of help is requested
  // the description will contain each question in a section, and it's corresponding answer
  // for each type of support requested, create a separate card
  let i = 9;
  const responseCount = latestItemResponses.length;
  while (i < responseCount) {
    // returns the number of columns parsed (always at least one)
    i += parseLatestItemResponses(latestItemResponses, i, body, subject);
  }
}
