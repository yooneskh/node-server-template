import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionMethod } from '../../resource-maker/resource-router';
import { UserController } from '../user/user-resource';
import { InvalidRequestError } from '../../global/errors';
import { generateToken } from '../../global/util';
import { MediaController } from '../media/media-resource';

const maker = new ResourceMaker('Auth');

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/login',
  async dataProvider(request, response) {

    const user = await UserController.findOne({
      filters: {
        phoneNumber: request.body.phoneNumber
      }
    });

    // user.verificationCode = generateRandomNumericCode(6);
    user.verificationCode = '111111';

    await user.save();

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/register',
  async dataProvider(request, response) {

    await UserController.createNew({
      payload: {
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        phoneNumber: request.body.phoneNumber,
        permissions: ['user.*'],
        verificationCode: '111111',
        // verificationCode: generateRandomNumericCode(6),
        token: undefined
      }
    });

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/verify',
  async dataProvider(request, response) {

    const phoneNumber = request.body.phoneNumber;
    const verificationCode = request.body.verificationCode;

    const user = await UserController.findOne({ filters: { phoneNumber }});

    if (!verificationCode || !user.verificationCode || verificationCode !== user.verificationCode) throw new InvalidRequestError('invalid code');

    user.verificationCode = undefined;

    // TODO: make sure is unique
    user.token = generateToken();

    return user.save();

  }
});

maker.addAction({
  method: ResourceActionMethod.GET,
  path: '/identity',
  async permissionFunctionStrict(user) {
    return !!user;
  },
  async dataProvider(request, response, user) {

    if (user && user.profile) {
      // tslint:disable-next-line: no-any
      (user as any).profile = await MediaController.singleRetrieve({ resourceId: user.profile });
    }

    return user;

  }
});

export const AuthRouter = maker.getRouter();
