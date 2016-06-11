import {Model} from "../../models/model"
import {Image} from "../../models/image"
import * as express from 'express'
import * as request from 'request'
export const router = express.Router()

router.get('/proxy/:id', function(req: express.Request, res: express.Response, next: express.NextFunction) {
    Image.pFindById(req.query('id'))
        .then((image: Image) => {
            console.log(image.constructor);
            request.get(image.originalUrl).pipe(res);
        })
        .catch(err => {
            res.sendStatus(404);
        });
});

router.get('/:id', function(req: express.Request, res: express.Response, next: express.NextFunction) {
    Image.pFindById(req.query('id'))
        .then(image => {
            return res.json(image.downgrade());
        })
        .catch(err => {
            res.sendStatus(404);
        });
});

router.post('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
    let image = new Image();
    image.originalUrl = req.body.url;
    image.tags = req.body.tags;

    //@TODO ハードコードなくす
    image.proxiedUrl = `https://atami.kikurage.xyz/v1/image/proxy/${image.id}`;

    image.pSave()
        .then(() => {
            res.status(200);
            res.json(image.downgrade())
        });
});