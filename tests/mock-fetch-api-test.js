/*
ISC License:
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for
any purpose with or without fee is hereby granted, provided that the
above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND ISC DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
*/

jest.autoMockOff();

describe('MockFetch test using function when()', () =>  {

   pit("can set a condition which is returned by fetch", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com').respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com').then((response) => {
         return response.json();

      }).then((data) => {
         expect(data).toBe('Hello World');
      });
   });


   pit("can set a condition which is returned by fetch", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com').respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com').then((response) => {
         response.json().then((data) => {
            expect(data).toBe('Hello World');
         });
      });
   });


   pit("test connection with default method GET", () => {

      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com').respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com', {}).then((response) => {
         expect(response.status).toBe(200);
      });
   });


   pit("only responds when matched correctly", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com').respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com', { method: 'PUT'}).then((response) => {

         expect(response.status).toBe(404);
         expect(response.statusText).toBe('Not Found');
      });
   });


   pit("also checks for an expected header value", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com')
         .withExpectedHeader('X-AuthToken','1234')
         .otherwiseRespondWith(401, "Not Authorized")
         .respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com', { method: 'GET', headers: new Headers({
         'X-AuthToken':'1234'
      })}).then((response) => {
         expect(response.status).toBe(200);
      });
   });


   pit("fails when expected header is not set", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com')
         .withExpectedHeader({'X-AuthToken':'1234'}).otherwiseRespondWith(401, "Not Authorized")
         .respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com', { method: 'GET'}).then((response) => {

         expect(response.status).toBe(401);
         expect(response.statusText).toBe('Not Authorized');
      });
   });


   pit("fails when expected header is has the wrong value", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com')
         .withExpectedHeader('X-AuthToken','1234').otherwiseRespondWith(401, "Not Authorized")
         .respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com', { method: 'GET', headers: new Headers({
         'X-AuthToken':'4321'
      })}).then((response) => {
         expect(response.status).toBe(401);
         expect(response.statusText).toBe('Not Authorized');
      });
   });


   pit("can check for multiple expected headers", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com')
         .withExpectedHeader('X-AuthToken','1234')
         .withExpectedHeader('BANANA','8757').otherwiseRespondWith(401, "Not Authorized")
         .respondWith(200, '"Hello World"');

      return fetch('http://mydomain.com', { method: 'GET', headers: new Headers({
         'X-AuthToken':'1234',
         'BANANA':'8757'
      })}).then((response) => {

         expect(response.status).toBe(200);
      });
   });


   pit("rejects the promise when simulating a failed network connection", () => {
      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com')
         .respondWith(200, '"Hello World"');

      MockFetch.failNextCall();
      return fetch('http://mydomain.com').then((response) => {
         expect(false).toBe(true);
      }, (error) => {
         expect(true).toBe(true);
      });
   });


   pit("rejects the promise ONLY for the next call when simulating a failed network connection", () => {

      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('GET', 'http://mydomain.com')
         .respondWith(200, '"Hello World"');

      MockFetch.failNextCall();
      fetch('http://mydomain.com').then((response) => { }, (error) => { });

      // should then succeed again...
      return fetch('http://mydomain.com').then((response) => {
         expect(response.status).toBe(200);
      }, (error) => {
         expect(false).toBe(true);
      });
   });


   pit("can match on the uploaded body", () => {

      var MockFetch  = require('../mock-fetch-api.js');

      MockFetch.when('POST', 'http://mydomain.com')
         .respondWith(200, '"Hello World"');

      MockFetch.failNextCall();
      return fetch('http://mydomain.com', {
         method: 'POST',
         body: '{"ID":"5"}'
      }).then((response) => {
         expect(false).toBe(true);
      }, (error) => {
         expect(true).toBe(true);
      });
   });

});



describe('MockFetch test using function whenAll()', () =>  {
  var MockFetch = null;

  beforeAll(() => {
    MockFetch = require('mock-fetch-api');

    var when = {
      url: 'http://mydomain.com/home',
      response: {
        status: 200,
        statusText: 'Success!',
      }
    };

    var when2 = {
      url: 'http://otherdomain.org',
      method: 'POST',
      headers: {
        'X-AuthToken': 1234,
        BANANA: 8757,
        otherwiseRespondWith: {
          status: 401,
          statusText: 'Not Authorized'
        }
      },
      response: {
        status: 200,
        statusText: 'Great!'
      }
    };

    var when3 = {
      url: 'http://anydomain.com.br',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        otherwiseRespondWith: {
          status: 404,
          statusText: 'Not Found'
        }
      },
      response: {
        status: 200,
        statusText: 'YEAH!'
      }
    };

    MockFetch.whenAll([when, when2, when3]);
  });


  pit("Should mydomain.com return a status 200", () => {
    return fetch('http://mydomain.com/home').then((response) => {
      expect(response.status).toBe(200);
    });
  });


  pit("Should mydomain.com return a status 200 when connection is failed", () => {
    MockFetch.failNextCall();

    return fetch('http://mydomain.com/home').then((response) => {
      expect(false).toBe(true);
    }, (error) => {
      expect(true).toBe(true);
    });
  });


  pit("Should otherdomain.org return a status 200 when login authorized", () => {
    var headers = new Headers({
      'X-AuthToken': 1234,
      BANANA: 8757
    });

    return fetch('http://otherdomain.org', { method: 'POST', headers: headers}).then((response) => {
      expect(response.status).toBe(200);
    });
  });


  pit("Should otherdomain.org return a status 401 when login not authorized", () => {
    var headers = new Headers({
      'X-AuthToken': 1234,
      BANANA: 8758 // Password wrong
    });

    return fetch('http://otherdomain.org', { method: 'POST', headers: headers}).then((response) => {
      expect(response.status).toBe(401);
    });
  });


  pit("Should anydomain.com.br return a status 200 when request is json", () => {
    var headers = new Headers({
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    });

    return fetch('http://anydomain.com.br', {headers: headers}).then((response) => {
      expect(response.status).toBe(200);
    });
  });

});
