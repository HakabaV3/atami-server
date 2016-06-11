import * as express from 'express'
import * as path from 'path'
import * as logger from 'morgan'
import * as bodyParser from 'body-parser'
import {router as index} from './routes/index'

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api', index);
app.use('/', index);

app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
    var err = new Error('Not Found') as any;
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err: any, res: express.Response, next: express.ErrorRequestHandler) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err: any, res: express.Response, next: express.ErrorRequestHandler) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

export default app