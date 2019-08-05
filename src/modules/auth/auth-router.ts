import Restana from 'restana';
import { sanitizeRequestFormat } from '../../global/sanitizers';
import { loginUser, verifyUser, registerUser } from './auth-controller';

export async function AuthRoutify(basePath: string = '', service: Restana.Service<Restana.Protocol.HTTP>) {

  service.post(basePath + '/login', (req, res) => {
    sanitizeRequestFormat(req, undefined, async () => {
      res.send({
        success: await loginUser(req.body.phoneNumber)
      });
    });
  });

  service.post(basePath + '/register', (req, res) => {
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

  service.post(basePath + '/verify', (req, res) => {
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

}
