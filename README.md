# mock-fetch-api
Mock http requests and responses using fetch API (or [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)). Straight forward functions makes it simple to create customizable and legible unit tests.


## Installation
    npm install --save-dev mock-fetch-api

## Usage
    var MockFetch = require('mock-fetch-api');

### Functions

#### when()
The when() function sets the required method and URL.  
```js
when(method, URL)    
when('GET', 'http://mydomain.com')    
```

#### withExpectedHeader()
The withExpectedHeader() function sets the required headers.  
```js
withExpectedHeader(Header-Field-Name, Header-Field-Type)  
withExpectedHeader('Content-Type', 'application/json')  
```


#### otherwiseRespondWith()
The otherwiseRespondWith() function sets the response if the header specified with the  withExpectedHeader() function does not correspond with the header passed to the fetch() function.  
```js
otherwiseRespondWith(status, statusText)  
otherwiseRespondWith(401, 'not authorised')  
```

#### respondWith()
The respondWith() function sets the response if all the requirements specified with the when() and withExpectedHeader() functions correspond with what is passed to the fetch() function.  
```js
respondWith(status, data)  
respondWith(401, '{"data":[{"text":"Hello"},{"text":"Goodbye"}]}')  
```

#### failNextCall()
The failNextCall() function forces the fetch to reject.  
```js
failNextCall()
```

#### whenAll()
The whenAll() function sets multiple configured in array with objects.
```js
var when1 = {
  url: 'http://mydomain.com/login',
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
    statusText: 'Success'
  }
};

// Default method is GET
var when2 = {
  url: 'http://mydomain.com/home',
  response: {
    status: 200,
    statusText: 'Success'
  },
};

MockFetch.router([when1, when2]);
```


## Examples
<strong>Check out the '__tests__' directory to view all examples. </strong> https://github.com/Larney11/mock-fetch-api/blob/master/tests/mock-fetch-api-test.js  

The following examples are unit tests using Jest.  

```js

pit("can set a condition which is returned by fetch", () => {
  var MockFetch  = require('../MockFetch.js');

  MockFetch.when('GET', 'http://mydomain.com').respondWith(200, '"Hello World"');

  return fetch('GET', 'http://mydomain.com').then((response) => {
     return response.json();

  }).then((data) => {
     expect(data).toBe('Hello World');
  });
});


pit("only responds when matched correctly", () => {
  var MockFetch  = require('mock-fetch-api');

  MockFetch.when('GET', 'http://mydomain.com').respondWith(200, '"Hello World"');

  return fetch('http://mydomain.com', { method: 'PUT'}).then((response) => {

  expect(response.status).toBe(404);
  expect(response.statusText).toBe('Not Found');
  });
});    


pit("also checks for an expected header value", () => {
   var MockFetch  = require('../MockFetch.js');

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
   var MockFetch  = require('../MockFetch.js');

   MockFetch.when('GET', 'http://mydomain.com')
      .withExpectedHeader({'X-AuthToken':'1234'}).otherwiseRespondWith(401, "Not Authorized")
      .respondWith(200, '"Hello World"');

   return fetch('http://mydomain.com', { method: 'GET'}).then((response) => {

      expect(response.status).toBe(401);
      expect(response.statusText).toBe('Not Authorized');
   });
});


pit("can check for multiple expected headers", () => {
   var MockFetch  = require('../MockFetch.js');

   MockFetch.when('GET', 'http://mydomain.com')
      .withExpectedHeader('X-AuthToken','1234').otherwiseRespondWith(401, "Not Authorized")
      .withExpectedHeader('Content-Type', 'application/json').otherwiseRespondWith(404, "Not Found")
      .respondWith(200, '"Hello World"');

   return fetch('http://mydomain.com', { method: 'GET', headers: new Headers({
      'X-AuthToken':'1234',
      'Content-Type': 'application/json'
   })}).then((response) => {

      expect(response.status).toBe(200);
   });
});


pit("rejects the promise when simulating a failed network connection", () => {
   var MockFetch  = require('../MockFetch.js');

   MockFetch.when('GET', 'http://mydomain.com')
      .respondWith(200, '"Hello World"');

   MockFetch.failNextCall();
   return fetch('http://mydomain.com').then((response) => {
      expect(false).toBe(true);
   }, (error) => {
      expect(true).toBe(true);
   });
});
```

### Example using whenAll() from beforeAll()

```js
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
        otherwiseRespondWith: { // Last Item!
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
        otherwiseRespondWith: { // Last Item!
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
```
