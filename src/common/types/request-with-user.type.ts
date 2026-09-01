export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}
