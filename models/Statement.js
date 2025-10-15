const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    },
    balance: Number,
    category: {
        type: String,
        default: 'Uncategorized'
    },
    payee: String
});

const statementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'image', 'excel'],
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    bankName: String,
    accountNumber: String,
    statementPeriod: {
        start: Date,
        end: Date
    },
    transactions: [transactionSchema],
    analytics: {
        totalCredits: {
            type: Number,
            default: 0
        },
        totalDebits: {
            type: Number,
            default: 0
        },
        netAmount: {
            type: Number,
            default: 0
        },
        transactionCount: {
            type: Number,
            default: 0
        },
        categoryBreakdown: {
            type: Map,
            of: Number
        },
        topPayees: [{
            name: String,
            amount: Number,
            count: Number
        }]
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingError: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate analytics before saving
statementSchema.pre('save', function(next) {
    if (this.transactions && this.transactions.length > 0) {
        let totalCredits = 0;
        let totalDebits = 0;
        const categoryMap = new Map();
        const payeeMap = new Map();

        this.transactions.forEach(tx => {
            if (tx.type === 'credit') {
                totalCredits += tx.amount;
            } else {
                totalDebits += Math.abs(tx.amount);
            }

            // Category breakdown
            const category = tx.category || 'Uncategorized';
            categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(tx.amount));

            // Payee tracking
            if (tx.payee) {
                const existing = payeeMap.get(tx.payee) || { amount: 0, count: 0 };
                payeeMap.set(tx.payee, {
                    amount: existing.amount + Math.abs(tx.amount),
                    count: existing.count + 1
                });
            }
        });

        this.analytics.totalCredits = totalCredits;
        this.analytics.totalDebits = totalDebits;
        this.analytics.netAmount = totalCredits - totalDebits;
        this.analytics.transactionCount = this.transactions.length;
        this.analytics.categoryBreakdown = categoryMap;

        // Top 5 payees
        this.analytics.topPayees = Array.from(payeeMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }

    next();
});

module.exports = mongoose.model('Statement', statementSchema);
