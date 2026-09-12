declare module "*.css";
declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
        __waSession?: any;
    }
}

export {};