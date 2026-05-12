export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen min-w-screen h-full flex flex-col items-center justify-center">
            {children}
        </div>
    );
};
//We don't default export it because this is a specific component for the auth module, and we want to keep it as a named export for better clarity and maintainability.
