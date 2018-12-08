export class User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  token: string;
  user_id?: string;
  facebook_id?: string;
  permission: UserPermission;
}

export class UserPermission {
  isAdmin: boolean;
}
