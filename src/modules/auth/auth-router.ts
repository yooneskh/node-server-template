import { sanitizeRequestFormat } from '../../global/sanitizers';
import { loginUser, verifyUser, registerUser } from './auth-controller';

import { Router } from 'express';
export const AuthRouter = Router();

AuthRouter.post('/login', (req, res) => {
  sanitizeRequestFormat(req, undefined, async () => {
    res.send({
      success: await loginUser(req.body.phoneNumber)
    });
  });
});

AuthRouter.post('/register', (req, res) => {
  sanitizeRequestFormat(req, undefined, async () => {
    res.send({
      success: !!(await registerUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber
      }))
    });
  });
});

AuthRouter.post('/verify', (req, res) => {
  sanitizeRequestFormat(req, undefined, () => {
    res.send({
      success: true,
      user: verifyUser({
        phoneNumber: req.body.phoneNumber,
        verificationCode: req.body.verificationCode
      })
    });
  });
});
