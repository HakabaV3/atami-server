import {Model} from "../../models/model"
import {Image} from "../../models/image"
import * as express from 'express'
export const router = express.Router()

router.get('/:id', function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(req.param('id'));
    Image.pFindById(req.param('id'))
        .then(image => {
            return res.json(image.downgrade());
        })
        .catch(err => {
            res.send(404);
        });
});

router.post('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
    let image = new Image();
    image.originalUrl = req.body.url;
    image.tags = req.body.tags;

    image.pSave()
        .then(() => {
            res.status(200);
            res.json(image.downgrade())
        });
});