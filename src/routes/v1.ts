import * as express from 'express'
import {router as image} from './v1/image'
export const router = express.Router()

router.use('/image', image);