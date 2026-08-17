let accessToken: string | null = null;
let currentUser: any = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => { accessToken = token; };
export const setUser = (user: any) => { currentUser = user; };
export const getUser = () => currentUser;