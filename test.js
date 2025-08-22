const { chromium } = require('playwright');

async function automateNaukriProfile() {
    // Check if required environment variables are set
    if (!process.env.NAUKRI_EMAIL || !process.env.NAUKRI_PASSWORD) {
        console.error('Please set NAUKRI_EMAIL and NAUKRI_PASSWORD environment variables');
        process.exit(1);
    }

    // Launch browser
    const browser = await chromium.launch({ 
        headless: process.env.CI ? true : false, // Headless in CI, visible locally
        slowMo: process.env.CI ? 0 : 1000 // No delay in CI, slow locally for visibility
    });
    
    const context = await browser.newContext({
        // Set user agent to avoid detection
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        // Set viewport
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();

    try {
        console.log('Navigating to Naukri.com...');
        await page.goto('https://www.naukri.com/', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });

        console.log('Clicking on Login...');
        // Look for login button/link
        await page.click('text=Login');
        
        // Wait for login form to appear
        await page.waitForSelector('form[name="login-form"]', { timeout: 10000 });

        console.log('Entering credentials...');
        // Enter email using environment variable
        await page.locator('(//form[@name="login-form"]//input)[1]').fill(process.env.NAUKRI_EMAIL);
        
        // Enter password using environment variable
        await page.locator('(//form[@name="login-form"]//input)[2]').fill(process.env.NAUKRI_PASSWORD);
        
        // Click login button
        await page.locator('//button[@class="btn-primary loginButton"]').click();
        
        // Wait for login to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        console.log('Login successful, looking for Complete Profile...');
        
        // Navigate to profile page
        try {
            await page.click('text=Complete Profile', { timeout: 5000 });
        } catch (error) {
            try {
                await page.click('a[href*="profile"]', { timeout: 5000 });
            } catch (error2) {
                console.log('Could not find profile link, navigating directly...');
                await page.goto('https://www.naukri.com/mnjuser/profile', {
                    waitUntil: 'networkidle',
                    timeout: 30000
                });
            }
        }
        
        await page.waitForTimeout(2000);

        console.log('Looking for resume headline edit button...');
        // Wait for and click the edit icon for resume headline
        const editIconSelector = '//div[@id="lazyResumeHead"]//div[@class="widgetHead"]//span[@class="edit icon"]';
        await page.waitForSelector(editIconSelector, { timeout: 15000 });
        await page.click(editIconSelector);

        // Wait for textarea to appear
        const textareaSelector = '//textarea[@id="resumeHeadlineTxt"]';
        await page.waitForSelector(textareaSelector, { timeout: 10000 });

        console.log('Adding random text to resume headline...');
        const randomText = `Experienced professional with expertise in technology and innovation - Updated ${new Date().toLocaleString()}`;
        
        // Clear existing text and add new text
        await page.fill(textareaSelector, '');
        await page.waitForTimeout(1000);
        await page.fill(textareaSelector, randomText);

        console.log('Saving changes...');
        // Click Save button
        await page.click('button:has-text("Save"), input[value="Save"]');
        
        // Wait for save to complete
        await page.waitForTimeout(3000);

        console.log('Editing again to remove text...');
        // Click edit icon again
        await page.click(editIconSelector);
        
        // Wait for textarea
        await page.waitForSelector(textareaSelector, { timeout: 10000 });
        
        // Clear the text
        await page.fill(textareaSelector, '');
        
        console.log('Saving empty headline...');
        // Save again
        await page.click('button:has-text("Save"), input[value="Save"]');
        
        // Wait for save to complete
        await page.waitForTimeout(3000);

        console.log('Process completed successfully!');
        
        // Take a success screenshot in CI
        if (process.env.CI) {
            await page.screenshot({ 
                path: 'success-screenshot.png', 
                fullPage: true 
            });
            console.log('Success screenshot saved');
        }

    } catch (error) {
        console.error('An error occurred:', error);
        
        // Take screenshot for debugging
        await page.screenshot({ 
            path: `error-screenshot-${Date.now()}.png`, 
            fullPage: true 
        });
        console.log('Error screenshot saved');
        
        // Log current URL for debugging
        console.log('Current URL:', page.url());
        
        // Re-throw error to fail the workflow
        throw error;
    } finally {
        // Close browser
        await browser.close();
    }
}

// Run the automation
automateNaukriProfile().catch(error => {
    console.error('Automation failed:', error);
    process.exit(1);
});
