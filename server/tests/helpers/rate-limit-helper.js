// tests/helpers/rate-limit-helper.js
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRateLimitRetry = async (testFn, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await testFn();
            
            if (result.status === 429) {
                if (attempt === maxRetries) {
                    console.warn(`⚠️ Test skipped due to rate limit after ${maxRetries} attempts`);
                    return { status: 429, skipped: true };
                }
                
                console.warn(`⚠️ Rate limit hit, attempt ${attempt}/${maxRetries}, waiting...`);
                await wait(1000 * attempt); // Exponential backoff
                continue;
            }
            
            return result;
        } catch (error) {
            if (attempt === maxRetries) throw error;
            await wait(500);
        }
    }
};

module.exports = { wait, withRateLimitRetry };
