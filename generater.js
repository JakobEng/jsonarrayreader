"use strict"
var fs = require('fs')

const generat = (importFile, options, callback) => {
  var jsonStream = fs.createReadStream(importFile, {flags: 'r', encoding: 'utf-8'})
  var check = true

  jsonStream.on('data', chuck => {
    if(check) format.init(chuck.toString())
      else format.startFormation(chuck.toString())
  })
  jsonStream.on('end', () => {
    format.whenEnd()
  })

  var format = {
    init: function(buf) {
      check = false
      this.num = 0
      this.errors = 0
      this.start = 0
      this.end = false
      this.buf = ''
      this.startFormation(buf.slice(buf.indexOf('[ {') + 1))
    },
    startFormation: function(buf) {
      this.buf += buf
      this.check = true
      while(this.check === true) {

        this.makeObject()

        //console.log(this.buf.slice(0, this.endOfObj))
        // console.log('start', this.startOfObj)
        // console.log('end', this.endOfObj)
        // console.log('quotation', this.quotation)
        // console.log('stop end', this.end)
        let jens = this.buf.slice(this.endOfObj + 1).replaceAll(' ', '').slice(0,1)
        // console.log('jens', jens)

        if(this.endOfObj >= 0) {
          this.processJSON(this.buf.slice(this.buf.indexOf('{'), this.endOfObj + 1))

          if(jens === ']' && this.end === true) {
            this.check = false
            this.buf = this.buf.slice(this.endOfObj + 2, 0)
            } else {
            this.buf = this.buf.slice(this.endOfObj + 2)
          }

        } else {
          this.check = false
        }
      }
    },
    setVariable: function() {
      this.startOfObj = this.buf.indexOf('{', this.start)
      this.endOfObj = this.buf.indexOf('}', this.start)
      this.quotation = this.buf.indexOf(': "', this.start)
    },
    makeObject: function() {
      this.start = 0
      this.level = 0
      this.makeObjCheck = true
      while(this.makeObjCheck) {
        this.setVariable()

        if(options.validateString !== false) {
          if((this.startOfObj === -1 || this.quotation < this.startOfObj) && this.quotation < this.endOfObj && this.quotation !== -1) {

            var thing = this.quotation + 2
            do {

              thing = this.buf.indexOf('"', thing + 1)
            } while(this.buf.charAt(thing - 1) === '\\')


            if(thing !== -1) {
              this.start = thing + 1
              continue
            } else {
              // console.log('num 2')
              this.makeObjCheck = false
              this.quotation = -1
              continue
            }
          }
        }

        if(this.endOfObj === -1) {
          // console.log('num 3')
          this.makeObjCheck = false
        } else if(this.startOfObj === -1) {
          this.start = this.endOfObj + 1
          this.level--
          if(this.level === 0) {
            // console.log('num 4')
            this.makeObjCheck = false
            this.end = true
          }
        } else if(this.startOfObj < this.endOfObj) {
          this.start = this.startOfObj + 1
          this.level++

        } else if(this.startOfObj > this.endOfObj) {
          this.start = this.endOfObj + 1
          this.level--


        } else {
          throw error2
        }

        if(this.level === 0) this.makeObjCheck = false
      }
    },
    processJSON: function(product) {
      this.num++
      console.log('Number of object processed ' + this.num)

      try {
        var validProduct = JSON.parse(product)
        if(options.addId === true) {
          validProduct.id = this.num
        }
        this.addData(validProduct)
      } catch(err) {
        // console.log(product)
        this.errors++
        callback(err, product, false)
      }
    },
    addData: function(validProduct) {
    if(typeof validProduct !== 'undefined') {

      callback(null, validProduct, false)

    }
    },
    whenEnd: function() {
      if(typeof this.buf === 'undefined') return callback('import file is emty', null, false)

      console.log('errors: ' + this.errors)
      console.log('finished')
      callback(null, {errors: this.errors}, true)
    }
  }
}

module.exports = generat


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}
