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

var cardFieldCount = {
  money: 7,
  supplies: 7,
  childcare: 11,
  emotional: 1,
  resources: 2,
};

var cardFieldTitles = {
  money: '##Money Requests##',
  supplies: '##Supplies/Errands##',
  childcare: '##Childcare & Petcare##',
  emotional: '##Emotional/Spiritual Support##',
  resources: '##Resources##',
};

var cardLabels = {
  money: ['$$$'],
  supplies: ['Supplies/Errands'],
  childcare: ['Childcare/Petcare'],
  emotional: ['Emotional/Spiritual'],
  resources: ['Resources'],
};

var cardStartHeaders = {
  'Do you need financial resources?': 'money',
  'Do you need help getting supplies or running errands?': 'supplies',
  'Are you looking for in person childcare and/or online activities for kids and/or petcare?':
    'childcare',
  'Are you looking for emotional or spiritual support?': 'emotional',
  'Do you need resource support, or support with anything not on this form already?':
    'resources',
};

var defaultLabels = ['English'];

function processCard(i, body, cardType, latestItemResponses, labels, subject) {
  var localBody = body.slice(0);
  localBody = localBody.concat(cardFieldTitles[cardType] + '\n');
  const end = i + cardFieldCount[cardType];
  do {
    i++;
    var formatted = Utilities.formatString(
      '**%s**\n %s\n\n',
      latestItemResponses[i].getItem().getTitle(),
      latestItemResponses[i].getResponse()
    );
    formatted = formatted.concat('\n');
    localBody = localBody.concat(formatted);
  } while (end > i);

  createCard(subject, localBody, [...defaultLabels, labels]);
  return i;
}

function parseLatestItemResponses(latestItemResponses, i, body, subject) {
  const headerTitle = latestItemResponses[i].getItem().getTitle();
  const response = latestItemResponses[i].getResponse();
  for (const cardStartHeaderKey of Object.keys(cardStartHeaders)) {
    if (headerTitle == cardStartHeaderKey && response == 'Yes') {
      const cardType = cardStartHeaders[cardStartHeaderKey];
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
  return i;
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
  for (var i = 9; i < latestItemResponses.length; i++) {
    i = parseLatestItemResponses(latestItemResponses, i, body, subject);
  }
}
