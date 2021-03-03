import { Request } from 'express';
import { User } from '../users/models/user.model';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
