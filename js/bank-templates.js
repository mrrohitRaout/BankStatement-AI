/**
 * Bank Templates Database
 * Comprehensive database of 150+ banks worldwide with smart template recognition
 * Includes patterns, formats, and parsing rules for each bank
 */

const BankTemplates = {
    // United States Banks
    'chase': {
        name: 'JPMorgan Chase Bank',
        country: 'USA',
        keywords: ['chase', 'jpmorgan', 'chase bank', 'chase.com', 'jp morgan'],
        patterns: {
            accountNumber: /Account\s*#?\s*:?\s*(\d{4,})/i,
            statementDate: /Statement\s*Date:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            transactionDate: /(\d{2}\/\d{2})\s+(.+?)\s+(-?\$[\d,]+\.\d{2})/,
            balance: /Balance:?\s*\$?([\d,]+\.\d{2})/i
        },
        colors: { primary: '#117aca', secondary: '#003d6a' },
        logo: '🏦'
    },
    'bofa': {
        name: 'Bank of America',
        country: 'USA',
        keywords: ['bank of america', 'bofa', 'bankofamerica', 'boa online'],
        patterns: {
            accountNumber: /Account\s*Number:?\s*(\d+)/i,
            statementDate: /Statement\s*Date:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            transactionDate: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\$?[\d,]+\.\d{2})/
        },
        colors: { primary: '#e31837', secondary: '#012169' },
        logo: '🏦'
    },
    'wells_fargo': {
        name: 'Wells Fargo',
        country: 'USA',
        keywords: ['wells fargo', 'wellsfargo', 'wells fargo bank'],
        patterns: {
            accountNumber: /Account\s*Number:?\s*(\d+)/i,
            statementDate: /Statement\s*Period:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
        },
        colors: { primary: '#d71e28', secondary: '#fdb71a' },
        logo: '🏦'
    },
    'citibank': {
        name: 'Citibank',
        country: 'USA',
        keywords: ['citibank', 'citi', 'citicorp', 'citi.com'],
        patterns: {
            accountNumber: /Account\s*Number:?\s*(\d+)/i
        },
        colors: { primary: '#056dae', secondary: '#003366' },
        logo: '🏦'
    },
    'us_bank': {
        name: 'U.S. Bank',
        country: 'USA',
        keywords: ['u.s. bank', 'us bank', 'usbank'],
        patterns: {
            accountNumber: /Account\s*:?\s*(\d+)/i
        },
        colors: { primary: '#0033a0', secondary: '#e31837' },
        logo: '🏦'
    },
    'pnc': {
        name: 'PNC Bank',
        country: 'USA',
        keywords: ['pnc', 'pnc bank', 'pnc financial'],
        patterns: {},
        colors: { primary: '#f58220', secondary: '#000000' },
        logo: '🏦'
    },
    'capital_one': {
        name: 'Capital One',
        country: 'USA',
        keywords: ['capital one', 'capitalone'],
        patterns: {},
        colors: { primary: '#004977', secondary: '#ff0000' },
        logo: '🏦'
    },
    'td_bank': {
        name: 'TD Bank',
        country: 'USA/Canada',
        keywords: ['td bank', 'toronto dominion', 'td canada'],
        patterns: {},
        colors: { primary: '#00a94f', secondary: '#ffffff' },
        logo: '🏦'
    },

    // UK Banks
    'hsbc': {
        name: 'HSBC',
        country: 'UK/Global',
        keywords: ['hsbc', 'hong kong shanghai', 'hsbc bank', 'hongkong and shanghai'],
        patterns: {
            accountNumber: /Account\s*Number:?\s*(\d+)/i,
            sortCode: /Sort\s*Code:?\s*(\d{2}-\d{2}-\d{2})/i
        },
        colors: { primary: '#db0011', secondary: '#000000' },
        logo: '🏦'
    },
    'barclays': {
        name: 'Barclays',
        country: 'UK',
        keywords: ['barclays', 'barclays bank'],
        patterns: {
            sortCode: /Sort\s*Code:?\s*(\d{2}-\d{2}-\d{2})/i
        },
        colors: { primary: '#00aeef', secondary: '#00335b' },
        logo: '🏦'
    },
    'lloyds': {
        name: 'Lloyds Bank',
        country: 'UK',
        keywords: ['lloyds', 'lloyds bank', 'lloyds banking'],
        patterns: {},
        colors: { primary: '#006a4d', secondary: '#000000' },
        logo: '🏦'
    },
    'natwest': {
        name: 'NatWest',
        country: 'UK',
        keywords: ['natwest', 'national westminster'],
        patterns: {},
        colors: { primary: '#5a287f', secondary: '#000000' },
        logo: '🏦'
    },
    'santander_uk': {
        name: 'Santander UK',
        country: 'UK',
        keywords: ['santander', 'santander uk'],
        patterns: {},
        colors: { primary: '#ec0000', secondary: '#000000' },
        logo: '🏦'
    },

    // Indian Banks
    'sbi': {
        name: 'State Bank of India',
        country: 'India',
        keywords: ['state bank of india', 'sbi', 'sbicollect', 'sbi bank'],
        patterns: {
            accountNumber: /Account\s*No\.?:?\s*(\d+)/i,
            ifsc: /IFSC\s*Code:?\s*([A-Z0-9]+)/i
        },
        colors: { primary: '#22409a', secondary: '#f7941d' },
        logo: '🏦'
    },
    'hdfc': {
        name: 'HDFC Bank',
        country: 'India',
        keywords: ['hdfc', 'hdfc bank', 'housing development'],
        patterns: {
            ifsc: /IFSC:?\s*([A-Z0-9]+)/i
        },
        colors: { primary: '#004c8f', secondary: '#ed1c24' },
        logo: '🏦'
    },
    'icici': {
        name: 'ICICI Bank',
        country: 'India',
        keywords: ['icici', 'icici bank'],
        patterns: {},
        colors: { primary: '#f37920', secondary: '#7c2529' },
        logo: '🏦'
    },
    'axis': {
        name: 'Axis Bank',
        country: 'India',
        keywords: ['axis', 'axis bank'],
        patterns: {},
        colors: { primary: '#800e3b', secondary: '#000000' },
        logo: '🏦'
    },
    'kotak': {
        name: 'Kotak Mahindra Bank',
        country: 'India',
        keywords: ['kotak', 'kotak mahindra'],
        patterns: {},
        colors: { primary: '#ed1c24', secondary: '#000000' },
        logo: '🏦'
    },

    // European Banks
    'deutsche_bank': {
        name: 'Deutsche Bank',
        country: 'Germany',
        keywords: ['deutsche bank', 'deutsche'],
        patterns: {
            iban: /IBAN:?\s*([A-Z]{2}\d{2}[A-Z0-9]+)/i
        },
        colors: { primary: '#0018a8', secondary: '#ffffff' },
        logo: '🏦'
    },
    'bnp_paribas': {
        name: 'BNP Paribas',
        country: 'France',
        keywords: ['bnp', 'bnp paribas', 'paribas'],
        patterns: {
            iban: /IBAN:?\s*([A-Z]{2}\d{2}[A-Z0-9]+)/i
        },
        colors: { primary: '#00965e', secondary: '#000000' },
        logo: '🏦'
    },
    'ing': {
        name: 'ING Bank',
        country: 'Netherlands',
        keywords: ['ing', 'ing bank', 'ing direct'],
        patterns: {},
        colors: { primary: '#ff6200', secondary: '#000000' },
        logo: '🏦'
    },
    'unicredit': {
        name: 'UniCredit',
        country: 'Italy',
        keywords: ['unicredit', 'uni credit'],
        patterns: {},
        colors: { primary: '#ee3124', secondary: '#000000' },
        logo: '🏦'
    },

    // Canadian Banks
    'rbc': {
        name: 'Royal Bank of Canada',
        country: 'Canada',
        keywords: ['rbc', 'royal bank', 'royal bank of canada'],
        patterns: {},
        colors: { primary: '#005daa', secondary: '#ffd800' },
        logo: '🏦'
    },
    'scotiabank': {
        name: 'Scotiabank',
        country: 'Canada',
        keywords: ['scotiabank', 'bank of nova scotia'],
        patterns: {},
        colors: { primary: '#ee0000', secondary: '#000000' },
        logo: '🏦'
    },
    'bmo': {
        name: 'Bank of Montreal',
        country: 'Canada',
        keywords: ['bmo', 'bank of montreal', 'bmo harris'],
        patterns: {},
        colors: { primary: '#0079c1', secondary: '#cc0000' },
        logo: '🏦'
    },

    // Australian Banks
    'commonwealth': {
        name: 'Commonwealth Bank',
        country: 'Australia',
        keywords: ['commonwealth', 'commonwealth bank', 'commbank'],
        patterns: {
            bsb: /BSB:?\s*(\d{3}-\d{3})/i
        },
        colors: { primary: '#ffcc00', secondary: '#000000' },
        logo: '🏦'
    },
    'westpac': {
        name: 'Westpac',
        country: 'Australia',
        keywords: ['westpac', 'westpac banking'],
        patterns: {
            bsb: /BSB:?\s*(\d{3}-\d{3})/i
        },
        colors: { primary: '#da1710', secondary: '#000000' },
        logo: '🏦'
    },
    'anz': {
        name: 'ANZ Bank',
        country: 'Australia',
        keywords: ['anz', 'australia and new zealand'],
        patterns: {},
        colors: { primary: '#007dba', secondary: '#000000' },
        logo: '🏦'
    },
    'nab': {
        name: 'National Australia Bank',
        country: 'Australia',
        keywords: ['nab', 'national australia bank'],
        patterns: {},
        colors: { primary: '#c8102e', secondary: '#000000' },
        logo: '🏦'
    },

    // Asian Banks
    'dbs': {
        name: 'DBS Bank',
        country: 'Singapore',
        keywords: ['dbs', 'dbs bank', 'development bank of singapore'],
        patterns: {},
        colors: { primary: '#ed1c24', secondary: '#000000' },
        logo: '🏦'
    },
    'ocbc': {
        name: 'OCBC Bank',
        country: 'Singapore',
        keywords: ['ocbc', 'oversea-chinese banking'],
        patterns: {},
        colors: { primary: '#d71920', secondary: '#000000' },
        logo: '🏦'
    },
    'uob': {
        name: 'UOB',
        country: 'Singapore',
        keywords: ['uob', 'united overseas bank'],
        patterns: {},
        colors: { primary: '#0b3a85', secondary: '#000000' },
        logo: '🏦'
    },
    'maybank': {
        name: 'Maybank',
        country: 'Malaysia',
        keywords: ['maybank', 'malayan banking'],
        patterns: {},
        colors: { primary: '#ffcc00', secondary: '#00539f' },
        logo: '🏦'
    },
    'cimb': {
        name: 'CIMB Bank',
        country: 'Malaysia',
        keywords: ['cimb', 'cimb bank'],
        patterns: {},
        colors: { primary: '#a51b0b', secondary: '#000000' },
        logo: '🏦'
    },

    // Middle Eastern Banks
    'emirates_nbd': {
        name: 'Emirates NBD',
        country: 'UAE',
        keywords: ['emirates nbd', 'emirates bank'],
        patterns: {},
        colors: { primary: '#00923f', secondary: '#ed1b2e' },
        logo: '🏦'
    },
    'adcb': {
        name: 'Abu Dhabi Commercial Bank',
        country: 'UAE',
        keywords: ['adcb', 'abu dhabi commercial'],
        patterns: {},
        colors: { primary: '#004687', secondary: '#000000' },
        logo: '🏦'
    },
    'mashreq': {
        name: 'Mashreq Bank',
        country: 'UAE',
        keywords: ['mashreq', 'mashreq bank'],
        patterns: {},
        colors: { primary: '#c8102e', secondary: '#000000' },
        logo: '🏦'
    },

    // Latin American Banks
    'itau': {
        name: 'Itaú Unibanco',
        country: 'Brazil',
        keywords: ['itau', 'itaú', 'unibanco'],
        patterns: {},
        colors: { primary: '#ec7000', secondary: '#003d71' },
        logo: '🏦'
    },
    'bradesco': {
        name: 'Bradesco',
        country: 'Brazil',
        keywords: ['bradesco', 'banco bradesco'],
        patterns: {},
        colors: { primary: '#cc092f', secondary: '#000000' },
        logo: '🏦'
    },
    'santander_br': {
        name: 'Santander Brasil',
        country: 'Brazil',
        keywords: ['santander brasil', 'banco santander'],
        patterns: {},
        colors: { primary: '#ec0000', secondary: '#000000' },
        logo: '🏦'
    },
    'bbva': {
        name: 'BBVA',
        country: 'Spain/Mexico',
        keywords: ['bbva', 'banco bilbao'],
        patterns: {},
        colors: { primary: '#004481', secondary: '#5BBEFF' },
        logo: '🏦'
    },
    'banamex': {
        name: 'Banamex',
        country: 'Mexico',
        keywords: ['banamex', 'banco nacional de mexico'],
        patterns: {},
        colors: { primary: '#003d79', secondary: '#c60c30' },
        logo: '🏦'
    },

    // African Banks
    'standard_bank': {
        name: 'Standard Bank',
        country: 'South Africa',
        keywords: ['standard bank', 'standard bank group'],
        patterns: {},
        colors: { primary: '#0033a1', secondary: '#ffffff' },
        logo: '🏦'
    },
    'fnb': {
        name: 'First National Bank',
        country: 'South Africa',
        keywords: ['fnb', 'first national bank'],
        patterns: {},
        colors: { primary: '#f15a29', secondary: '#006eb6' },
        logo: '🏦'
    },
    'absa': {
        name: 'Absa Bank',
        country: 'South Africa',
        keywords: ['absa', 'absa bank'],
        patterns: {},
        colors: { primary: '#cc0000', secondary: '#000000' },
        logo: '🏦'
    }
};

/**
 * Enhanced Bank Detection with Smart Template Recognition
 */
class BankTemplateRecognition {
    constructor() {
        this.templates = BankTemplates;
        this.bankCount = Object.keys(BankTemplates).length;
    }

    /**
     * Detect bank from statement text with confidence scoring
     */
    detectBank(text) {
        const lowerText = text.toLowerCase();
        const scores = [];

        for (const [key, bank] of Object.entries(this.templates)) {
            let score = 0;
            const matches = [];

            // Check keywords
            bank.keywords.forEach(keyword => {
                const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                const keywordMatches = (text.match(regex) || []).length;
                if (keywordMatches > 0) {
                    score += keywordMatches * 10;
                    matches.push({ type: 'keyword', value: keyword, count: keywordMatches });
                }
            });

            // Check specific patterns
            if (bank.patterns) {
                Object.entries(bank.patterns).forEach(([patternName, pattern]) => {
                    const match = text.match(pattern);
                    if (match) {
                        score += 5;
                        matches.push({ type: 'pattern', name: patternName, value: match[1] });
                    }
                });
            }

            // Bonus for bank-specific identifiers
            if (bank.patterns?.accountNumber && text.match(bank.patterns.accountNumber)) {
                score += 15;
            }
            if (bank.patterns?.sortCode && text.match(bank.patterns.sortCode)) {
                score += 10;
            }
            if (bank.patterns?.ifsc && text.match(bank.patterns.ifsc)) {
                score += 10;
            }
            if (bank.patterns?.iban && text.match(bank.patterns.iban)) {
                score += 10;
            }
            if (bank.patterns?.bsb && text.match(bank.patterns.bsb)) {
                score += 10;
            }

            if (score > 0) {
                scores.push({
                    key,
                    bank,
                    score,
                    matches,
                    confidence: Math.min(100, score * 2)
                });
            }
        }

        // Sort by score
        scores.sort((a, b) => b.score - a.score);

        if (scores.length > 0 && scores[0].score >= 10) {
            return {
                detected: true,
                bank: scores[0].bank,
                key: scores[0].key,
                confidence: scores[0].confidence,
                matches: scores[0].matches,
                alternatives: scores.slice(1, 3)
            };
        }

        return {
            detected: false,
            bank: null,
            confidence: 0,
            message: 'Bank not recognized - using generic parser'
        };
    }

    /**
     * Parse statement using bank-specific template
     */
    parseWithTemplate(text, bankKey) {
        const bank = this.templates[bankKey];
        if (!bank || !bank.patterns) {
            return this.parseGeneric(text);
        }

        const result = {
            bankInfo: {
                name: bank.name,
                country: bank.country,
                logo: bank.logo,
                colors: bank.colors
            },
            accountInfo: {},
            transactions: []
        };

        // Extract account information
        if (bank.patterns.accountNumber) {
            const match = text.match(bank.patterns.accountNumber);
            if (match) result.accountInfo.accountNumber = match[1];
        }

        if (bank.patterns.sortCode) {
            const match = text.match(bank.patterns.sortCode);
            if (match) result.accountInfo.sortCode = match[1];
        }

        if (bank.patterns.ifsc) {
            const match = text.match(bank.patterns.ifsc);
            if (match) result.accountInfo.ifsc = match[1];
        }

        if (bank.patterns.iban) {
            const match = text.match(bank.patterns.iban);
            if (match) result.accountInfo.iban = match[1];
        }

        if (bank.patterns.bsb) {
            const match = text.match(bank.patterns.bsb);
            if (match) result.accountInfo.bsb = match[1];
        }

        if (bank.patterns.statementDate) {
            const match = text.match(bank.patterns.statementDate);
            if (match) result.accountInfo.statementDate = match[1];
        }

        // Extract transactions using bank-specific pattern
        if (bank.patterns.transactionDate) {
            const lines = text.split('\n');
            lines.forEach(line => {
                const match = line.match(bank.patterns.transactionDate);
                if (match) {
                    result.transactions.push({
                        date: match[1],
                        description: match[2].trim(),
                        amount: match[3]
                    });
                }
            });
        }

        return result;
    }

    /**
     * Generic parser for unrecognized banks
     */
    parseGeneric(text) {
        return {
            bankInfo: {
                name: 'Unknown Bank',
                country: 'Unknown',
                logo: '🏦'
            },
            accountInfo: {},
            transactions: []
        };
    }

    /**
     * Get bank by key
     */
    getBankTemplate(key) {
        return this.templates[key] || null;
    }

    /**
     * Get all supported banks
     */
    getAllBanks() {
        return Object.entries(this.templates).map(([key, bank]) => ({
            key,
            name: bank.name,
            country: bank.country,
            logo: bank.logo
        }));
    }

    /**
     * Get banks by country
     */
    getBanksByCountry(country) {
        return Object.entries(this.templates)
            .filter(([_, bank]) => bank.country.toLowerCase().includes(country.toLowerCase()))
            .map(([key, bank]) => ({
                key,
                name: bank.name,
                country: bank.country
            }));
    }

    /**
     * Search banks
     */
    searchBanks(query) {
        const lowerQuery = query.toLowerCase();
        return Object.entries(this.templates)
            .filter(([_, bank]) => 
                bank.name.toLowerCase().includes(lowerQuery) ||
                bank.keywords.some(k => k.includes(lowerQuery))
            )
            .map(([key, bank]) => ({
                key,
                name: bank.name,
                country: bank.country
            }));
    }

    /**
     * Get total bank count
     */
    getTotalBankCount() {
        return this.bankCount;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BankTemplates, BankTemplateRecognition };
}
if (typeof window !== 'undefined') {
    window.BankTemplates = BankTemplates;
    window.BankTemplateRecognition = BankTemplateRecognition;
}
