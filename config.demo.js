const demoData = [
  {
    id: '1',
    value: 'value1'
  },
  {
    id: '2',
    value: 'value2'
  }
]

module.exports = {
  '/url/demo.json': function (req, callback) {
    setTimeout(() => {
      callback({
        status: 'ok',
        result: {
          data: demoData
        }
      })
    })
  }
}