/* global describe it */

const { strict: assert } = require('assert')
const asn1 = require('..')
const fixtures = require('./fixtures')
const jsonEqual = fixtures.jsonEqual

describe('asn1.js models', function () {
  describe('plain use', function () {
    it('should encode submodel', function () {
      const SubModel = asn1.define('SubModel', function () {
        this.seq().obj(
          this.key('b').octstr()
        )
      })
      const Model = asn1.define('Model', function () {
        this.seq().obj(
          this.key('a').int(),
          this.key('sub').use(SubModel)
        )
      })

      const data = { a: 1n, sub: { b: Buffer.from('XXX') } }
      const wire = Model.encode(data, 'der')
      assert.equal(wire.toString('hex'), '300a02010130050403585858')
      const back = Model.decode(wire, 'der')
      jsonEqual(back, data)
    })

    it('should honour implicit tag from parent', function () {
      const SubModel = asn1.define('SubModel', function () {
        this.seq().obj(
          this.key('x').octstr()
        )
      })
      const Model = asn1.define('Model', function () {
        this.seq().obj(
          this.key('a').int(),
          this.key('sub').use(SubModel).implicit(0)
        )
      })

      const data = { a: 1n, sub: { x: Buffer.from('123') } }
      const wire = Model.encode(data, 'der')
      assert.equal(wire.toString('hex'), '300a020101a0050403313233')
      const back = Model.decode(wire, 'der')
      jsonEqual(back, data)
    })

    it('should honour explicit tag from parent', function () {
      const SubModel = asn1.define('SubModel', function () {
        this.seq().obj(
          this.key('x').octstr()
        )
      })
      const Model = asn1.define('Model', function () {
        this.seq().obj(
          this.key('a').int(),
          this.key('sub').use(SubModel).explicit(0)
        )
      })

      const data = { a: 1n, sub: { x: Buffer.from('123') } }
      const wire = Model.encode(data, 'der')
      assert.equal(wire.toString('hex'), '300c020101a00730050403313233')
      const back = Model.decode(wire, 'der')
      jsonEqual(back, data)
    })

    it('should get model with function call', function () {
      const SubModel = asn1.define('SubModel', function () {
        this.seq().obj(
          this.key('x').octstr()
        )
      })
      const Model = asn1.define('Model', function () {
        this.seq().obj(
          this.key('a').int(),
          this.key('sub').use(function (obj) {
            assert.equal(obj.a, 1n)
            return SubModel
          })
        )
      })

      const data = { a: 1n, sub: { x: Buffer.from('123') } }
      const wire = Model.encode(data, 'der')
      assert.equal(wire.toString('hex'), '300a02010130050403313233')
      const back = Model.decode(wire, 'der')
      jsonEqual(back, data)
    })

    it('should support recursive submodels', function () {
      const PlainSubModel = asn1.define('PlainSubModel', function () {
        this.int()
      })
      const RecursiveModel = asn1.define('RecursiveModel', function () {
        this.seq().obj(
          this.key('plain').bool(),
          this.key('content').use(function (obj) {
            if (obj.plain) {
              return PlainSubModel
            } else {
              return RecursiveModel
            }
          })
        )
      })

      const data = {
        plain: false,
        content: {
          plain: true,
          content: 1n
        }
      }
      const wire = RecursiveModel.encode(data, 'der')
      assert.equal(wire.toString('hex'), '300b01010030060101ff020101')
      const back = RecursiveModel.decode(wire, 'der')
      jsonEqual(back, data)
    })
  })
})
