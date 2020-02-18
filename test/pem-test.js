/* global describe it */

const { strict: assert } = require('assert')
const asn1 = require('..')

describe('asn1.js PEM encoder/decoder', function () {
  const model = asn1.define('Model', function () {
    this.seq().obj(
      this.key('a').int(),
      this.key('b').bitstr(),
      this.key('c').int()
    )
  })

  const hundred = Buffer.alloc(100, 'A')

  it('should encode PEM', function () {
    const out = model.encode({
      a: 123n,
      b: {
        data: hundred,
        unused: 0
      },
      c: 456n
    }, 'pem', {
      label: 'MODEL'
    })

    const expected =
        '-----BEGIN MODEL-----\n' +
        'MG4CAXsDZQBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB\n' +
        'QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB\n' +
        'QUFBQUFBQUFBQUFBAgIByA==\n' +
        '-----END MODEL-----'
    assert.equal(out, expected)
  })

  it('should decode PEM', function () {
    const expected =
        '-----BEGIN MODEL-----\n' +
        'MG4CAXsDZQBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB\n' +
        'QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB\n' +
        'QUFBQUFBQUFBQUFBAgIByA==\n' +
        '-----END MODEL-----'

    const out = model.decode(expected, 'pem', { label: 'MODEL' })
    assert.equal(out.a.toString(), '123')
    assert.equal(out.b.data.toString(), hundred.toString())
    assert.equal(out.c.toString(), '456')
  })
})
