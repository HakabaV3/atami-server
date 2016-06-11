import * as express from 'express'
import {router as v1} from './v1'
export const router = express.Router()

router.use('/v1', v1);

router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.send("Hello World!");
});
