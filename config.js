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
  '/url/demo.json': function (req, res) {
    setTimeout(() => {
      res.json({
        status: 'ok',
        result: {
          data: demoData
        }
      })
    })
  }
}