const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

const tripGenerateSchema = z.object({
    body: z.object({
        destination: z.string().min(2, 'Destination is required'),
        durationDays: z.number().min(1).max(14, 'Max duration is 14 days'),
        budgetTier: z.enum(['Low', 'Medium', 'High']),
        interests: z.array(z.string()).optional(),
    }),
});

const updateTripSchema = z.object({
    body: z.object({
        destination: z.string().optional(),
        durationDays: z.number().min(1).max(14).optional(),
        budgetTier: z.enum(['Low', 'Medium', 'High']).optional(),
        interests: z.array(z.string()).optional(),
        itinerary: z.array(z.any()).optional(),
        packingList: z.array(z.any()).optional(),
    }),
});

const regenerateDaySchema = z.object({
    body: z.object({
        dayNumber: z.number().min(1),
        feedback: z.string().optional(),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    tripGenerateSchema,
    updateTripSchema,
    regenerateDaySchema,
};
