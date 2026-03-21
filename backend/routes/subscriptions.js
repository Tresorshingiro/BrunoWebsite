const router = require('express').Router()
const { subscribe, unsubscribe } = require('../controllers/subscriberController')

router.post('/', subscribe)
router.get('/unsubscribe', unsubscribe)

module.exports = router
