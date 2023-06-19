export interface ISendMailInput {
  template: string;
  to: string;
  user: string;
}

export interface ISendMailPayload {
  isSent: boolean;
}
