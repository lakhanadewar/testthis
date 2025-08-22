const { chromium } = require('playwright');

async function automateNaukriProfile() {
    // Launch browser
    const browser = await chromium.launch({ 
        headless: false, // Set to true if you want to run in background
        slowMo: 1000 // Slow down actions for better visibility
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to Naukri.com...');
        await page.goto('https://www.naukri.com/');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');

        console.log('Clicking on Login...');
        // Look for login button/link
        await page.click('text=Login');
        
        // Wait for login form to appear
        // page.locator('(//form[@name="login-form"]//input)[1]')').waitForSelector({ timeout: 5000 });

        console.log('Entering credentials...');
        // Enter email - Replace with your actual email
        await page.locator('(//form[@name="login-form"]//input)[1]').fill('apurvanalgundwar@gmail.com');
        
        // Enter password - Replace with your actual password
        await page.locator('(//form[@name="login-form"]//input)[2]').fill('dwfU55$u_Z!_XSP');
        
        // Click login button
        await page.locator('//button[@class="btn-primary loginButton"]').click();
        
        // Wait for login to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        console.log('Looking for Complete Profile...');
        // Click on Complete Profile - this might vary based on page layout
        try {
            await page.click('text=Complete Profile', { timeout: 5000 });
        } catch (error) {
            // Alternative selectors if the first one doesn't work
            try {
                await page.click('a[href*="profile"]');
            } catch (error2) {
                console.log('Could not find Complete Profile link, trying to navigate to profile page...');
                await page.goto('https://www.naukri.com/mnjuser/profile');
            }
        }
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('Looking for resume headline edit button...');
        // Wait for and click the edit icon for resume headline
        const editIconSelector = '//div[@id="lazyResumeHead"]//div[@class="widgetHead"]//span[@class="edit icon"]';
        await page.waitForSelector(editIconSelector, { timeout: 10000 });
        await page.click(editIconSelector);

        // Wait for textarea to appear
        const textareaSelector = '//textarea[@id="resumeHeadlineTxt"]';
        await page.waitForSelector(textareaSelector, { timeout: 5000 });

        console.log('Adding random text to resume headline...');
        const randomText = `Experienced professional with expertise in technology and innovation - Updated ${new Date().toLocaleString()}`;
        
        // Clear existing text and add new text
        await page.fill(textareaSelector, '');
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
        await page.waitForSelector(textareaSelector, { timeout: 5000 });
        
        // Clear the text
        await page.fill(textareaSelector, '');
        
        console.log('Saving empty headline...');
        // Save again
        await page.click('button:has-text("Save"), input[value="Save"]');
        
        // Wait for save to complete
        await page.waitForTimeout(3000);

        console.log('Process completed successfully!');

    } catch (error) {
        console.error('An error occurred:', error);
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        console.log('Screenshot saved as error-screenshot.png');
    } finally {
        // Close browser
        await browser.close();
    }
}

// Run the automation
automateNaukriProfile().catch(console.error);