export const authenticate = (req, res, next) => {
    // Placeholder authentication logic to prevent crashing
    req.user = { id: "mock-user-1", role: "admin" }; 
    next();
};
