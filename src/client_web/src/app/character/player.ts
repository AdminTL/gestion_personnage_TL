import { Character } from './character';

export interface Player {
  character: Character[];
  date_modify: number;
  email: string;
  facebook_id: string;
  family_name: string;
  given_name: string;
  google_id: string;
  locale: string;
  name: string;
  passe_saison_2018: boolean;
  password: string;
  permission: string;
  postal_code: string;
  total_point_merite: number;
  twitter_id: string;
  user_id: string;
  username: string;
  verified_email: boolean;
}
