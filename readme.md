A plugin package to do mock response with the help of AnyProxy 4.0, the basic idea is fork from the [dora-plugin-proxy](https://github.com/dora-js/dora-plugin-proxy).

# Install
Install the module through AnyProxy package management, you can find this package through `mock-response`.

# How to use
You can edit the configuration in AnyProxy directy, a demo configuration file could be like this:

```javascript

module.exports = {
  // mock response
  'remote/demo.json': function (req, res) {
    setTimeout(() => {
      res.json({
        stat: 'ok',
        data: []
      })
    }, 300);
  },
  // map local, replace the remote file.js with local file
  'remote/file.js': 'fullpath/of/local/file.js',
  // inverse proxy
  'example.com/remote/path': 'http://localhost/local/path'
}

```

## Mock response
Mock response for specified urls, you can simulate a network delay with `setTimeout`. In the related resposne function, this module exports some meta data and method for your convenience.

```javascript
/*
  the function to do the mock thing
  @param req  the request data
    {req.url} full url of the request
    {req.protocol}
    {req.headers} the headers of the request
    {req.body} the buffer body of the ruequest
  @param res  a util to do response, it contains some handy functions
    {req.json(object)} response a json object
    {req.set(object|{key, value})} set reponse headers
    {req.type(json|html|text|png)} set the mime types
    {req.status(statusCode)} set status code
    {req.jsonp(json[, callbacQueryName])} return a jsonp
    {req.end(string|object)}  response the data

*/
function (req, res) {

}

```

## Map local

Map the remote file path with local file, useful when want to proxy a remote file
```javascript
'remote/file.js': 'fullpath/of/local/file.js'
```

## Inverse proxy

Map remote request to another target

```javascript
//
'example.com/remote/path': 'http://localhost/local/path'

```
