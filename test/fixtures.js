const { strict: assert } = require('assert')

function jsonEqual (a, b) {
  assert.deepEqual( // eslint-disable-line node/no-deprecated-api
    a,
    b
  )
}
exports.jsonEqual = jsonEqual
