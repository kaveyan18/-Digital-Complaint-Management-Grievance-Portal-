import { generateComplaintId } from '../utils/idGenerator';

describe('ID Generator', () => {
    it('should generate a complaint ID with correct format', () => {
        const id = generateComplaintId();
        const year = new Date().getFullYear();

        expect(id).toMatch(new RegExp(`^CMP-${year}-[A-Z0-9]{6}$`));
    });

    it('should generate unique IDs', () => {
        const id1 = generateComplaintId();
        const id2 = generateComplaintId();
        expect(id1).not.toBe(id2);
    });
});
