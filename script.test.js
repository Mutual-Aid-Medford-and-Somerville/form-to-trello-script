import { submitToTrello } from './script';
import { sprintf } from 'sprintf';
import moment from 'moment';

const getResponsesMock = jest.fn(() => {
  return [
    {
      getTimestamp: () => 1604325600,
      getItemResponses: jest.fn(() => {
        return [
          { getResponse: () => 'For myself' },      // Filling out for
          { getResponse: () => 'Test Name' },       // Name
          { getResponse: () => 'English' },         // Language
          { getResponse: () => 'They/Them' },       // Pronouns
          { getResponse: () => 'Somerville' },      // City
          { getResponse: () => 'Phone' },           // Preferred contact
          { getResponse: () => '(123) 456-7890' },  // Contact method
          { getResponse: () => 'Yes' },             // Connect To
          { getResponse: () => 'Davis Square' },    // Neighborhood
          // Actual questions
          {
            getItem: () => {
              getTitle: () => 'Do you need financial resources?'
            },
            getResponse: () => 'Yes'
          },
          {
            getItem: () => {
              getTitle: () => 'Should throw an error?'
            },
            getResponse: () => 'Yes'
          },
          {
            getItem: () => {
              getTitle: () => 'Anything about yourself you’d like to share (zero expectation if you’d rather not)'
            },
            getResponse: () => 'Yes'
          },
          { getResponse: () => 'TEST ADDR' },       // Personal info
          { getResponse: () => 'Small Group' },     // Level of sharing
          { getResponse: () => 'Address' },         // What info
          { getResponse: () => 'Yes!' }             // Follow up
        ];
      })
    }
  ]
});

const getActiveFormMock = jest.fn(() => {
  return {
    getResponses: getResponsesMock
  };
});

global.FormApp = {
  getActiveForm: getActiveFormMock
};

global.Utilities = {
  formatDate: (ts, zone, formatstr) => moment.unix(ts).format(formatstr),
  formatString: (...args) => sprintf(...args)
}

global.Logger = {
  log: jest.fn()
}

global.UrlFetchApp = {
  fetch: jest.fn()
}

global.CacheService = {
  get: jest.fn(),
  put: jest.fn()
}

test('submitToTrello acts according to expectations', () => {
  submitToTrello();
  expect(getActiveFormMock).toHaveBeenCalled();
});