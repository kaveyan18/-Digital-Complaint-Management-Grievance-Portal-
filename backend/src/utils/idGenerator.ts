export const generateComplaintId = (): string => {
    const now = new Date();
    const year = now.getFullYear();

    // Generate 6 random alphanumeric characters
    // unique random string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomChars = '';
    for (let i = 0; i < 6; i++) {
        randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `CMP-${year}-${randomChars}`;
};
