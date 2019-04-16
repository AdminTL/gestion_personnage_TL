export interface StatusHttpGetInfo {
  fileURL: string;
  isAuth: string;
  userHasWriterPerm: boolean;
  hastAccessPerm: boolean;
  emailGoogleService: string;
  canGenerate: boolean;
  lastLocalDocUpdate: number;
}

export interface StatusHttpUpdateFileURL {
  status: string;
  fileURL: string;
}
