import jwt from 'jsonwebtoken';

const authenticate = (req: any, res: any, next: any) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];
  if (null == token) {
    return res.status(401).send({ status: 401, message: 'No token.' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string, (error: any, user: any) => {
    if (error) {
      return res.status(403).send({ status: 403, message: 'Token is not valid.' });
    }
    req.body.user = user;
    next();
  });
};

export { authenticate };