declare const sendOTPResponse: (to: string, otp: string) => Promise<void>;
declare const onboardMail: (to: string, userName: string) => Promise<void>;
declare const accountDeleteMail: (to: string, userName: string) => Promise<void>;
export { sendOTPResponse, onboardMail, accountDeleteMail };
//# sourceMappingURL=nodemailer.d.ts.map