import express from 'express'
import authentication from './users/authentication'

const router = express.Router()
export default (): express.Router => {
    authentication(router)
    return router
}