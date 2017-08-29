'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const http = require('http')
const BaseRequestManager = require('../../src/Request')

const ApiClient = require('../../src/ApiClient')
const PORT = '3333'

test.group('ApiClient', () => {
  test('make a request using the api client', async (assert) => {
    process.env.TEST_SERVER_URL = 'http://localhost:3333'
    const api = new ApiClient(BaseRequestManager())
    const server = http.createServer((req, res) => res.end('handled')).listen(PORT)
    const { text } = await api.post('/').end()
    assert.equal(text, 'handled')
    server.close()
  })

  test('make sure to set plain cookies', async (assert) => {
    process.env.TEST_SERVER_URL = 'http://localhost:3333'
    const api = new ApiClient(BaseRequestManager())
    const server = http.createServer((req, res) => res.end(req.headers.cookie)).listen(PORT)
    const { text } = await api.post('/').plainCookie('name', 'virk').end()
    assert.equal(text, 'name=virk')
    server.close()
  })

  test('do not prefix the server url when complete url is defined', async (assert) => {
    const api = new ApiClient(BaseRequestManager())
    const server = http.createServer((req, res) => res.end(req.headers.cookie)).listen(PORT)
    const { text } = await api.post('http://localhost:3333').plainCookie('name', 'virk').end()
    assert.equal(text, 'name=virk')
    server.close()
  })
})
