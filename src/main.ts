import Restana from 'restana';
import * as BodyParser from 'body-parser';

import './global/database';
import { AuthRoutify } from './modules/auth/auth-router';

const app = Restana();

app.use(BodyParser.json());

app.get('/test/:id', (req, res) => res.send({success: true, data: req.params.id}));

AuthRoutify('/api/v1/auth', app);

export default app;
