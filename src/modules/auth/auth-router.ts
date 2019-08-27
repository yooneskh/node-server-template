import { sanitizeRequestFormat } from '../../global/sanitizers';
import { loginUser, verifyUser, registerUser } from './auth-controller';

import { Router } from 'express';
export const AuthRouter = Router();

AuthRouter.post('/login', (req, res, next) => {
  sanitizeRequestFormat(req, res, next, undefined, async () => {
    res.send({
      success: await loginUser(req.body.phoneNumber)
    });
  });
});

AuthRouter.post('/register', (req, res, next) => {
  sanitizeRequestFormat(req, res, next, undefined, async () => {
    res.send({
      success: !!(await registerUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber
      }))
    });
  });
});

AuthRouter.post('/verify', (req, res, next) => {
  sanitizeRequestFormat(req, res, next, undefined, async () => {
    res.send({
      success: true,
      user: await verifyUser({
        phoneNumber: req.body.phoneNumber,
        verificationCode: req.body.verificationCode
      })
    });
  });
});
