export interface StatusHttpGetInfo {
  fileURL: string;
  isAuth: boolean;
  userHasWriterPerm: boolean;
  hasAccessPerm: boolean;
  emailGoogleService: string;
  canGenerate: boolean;
  lastLocalDocUpdate: number;
}

export interface StatusHttpUpdateFileURL {
  status: string;
  fileURL: string;
}
