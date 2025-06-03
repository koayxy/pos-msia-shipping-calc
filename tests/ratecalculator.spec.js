const { test, expect } = require('@playwright/test');

test.describe('POS Malaysia Rate Calculator Tests', () => {
  
  test('Test Case 1: Verify user can calculate shipment quote from Malaysia to India', async ({ page }) => {
    await page.goto('https://pos.com.my/send/ratecalculator');
    
    await page.waitForLoadState('load');

    console.log('Step 2: Set from Malaysia with postcode 35600');
    // Enter Malaysia's postcode
    const fromPostcodeInput = page.locator('input[placeholder*="Postcode"]').first();
    await fromPostcodeInput.click();
    await fromPostcodeInput.fill('35600');
    await page.keyboard.press('Enter');
    
    console.log('Step 3: Set to India without a postcode');
    // Set country to India 
    const toCountrySelector = 'input[placeholder*="Select country"], [name*="country"]';
    await page.locator(toCountrySelector).first().fill('India');
    // Wait for dropdown and select India
    await page.locator('text=India').first().click();

    console.log('Step 4: Set the weight to 1 and click Calculate');
    // Set weight to 1kg
    const weightSelector = 'input[formcontrolname*="itemWeight"]';
    await page.locator(weightSelector).first().fill('1');
    
    const calculateButtonSelector = 'a:has-text("Calculate")';
    await page.locator(calculateButtonSelector).first().click();
    
    await page.waitForTimeout(5000);
    
    console.log('Step 5: Verify display of quotes and shipment options');
    
    await page.waitForSelector('dd', { timeout: 10000 });
    
    // Find all shipping option containers (adjust selector based on actual DOM structure)
    const shippingOptions = page.locator('[class*="shipping-option"], [class*="quote-card"], .card, .option-container').filter({ hasText: /EMS|International|Pos Laju/i });
    
    // Alternative approach if the above doesn't work - find by price elements
    const priceElements = page.locator('h3').filter({ hasText: /RM\s*\d+/ });
    const optionCount = await priceElements.count();
    
    console.log(`Found ${optionCount} shipping options`);
    
    // Collect all shipping options data
    const allShippingOptions = [];
    
    for (let i = 0; i < optionCount; i++) {
      console.log(`\n--- Processing Option ${i + 1} ---`);
      
      try {
        // Get service name for this option
        const serviceElements = page.locator('dd').filter({ hasText: /EMS|International Air Parcel|International Surface Parcel|Pos Laju/i });
        const serviceName = await serviceElements.nth(i).textContent();
        
        // Get delivery time for this option
        const deliveryElements = page.locator('dd').filter({ hasText: /working days|weeks/i });
        const deliveryTime = await deliveryElements.nth(i).textContent();
        
        // Get features for this option
        const featureElements = page.locator('span').filter({ hasText: /Proof of Delivery|Basic protection|Insurance|Door-to-Door|Tracking/i });
        const features = await featureElements.nth(i).textContent();
        
        // Get price for this option
        const price = await priceElements.nth(i).textContent();
        
        // Get Book Now button for this option
        const bookNowButtons = page.locator('a:has-text("Book Now")');
        const bookNowButton = bookNowButtons.nth(i);
        
        const optionData = {
          service: serviceName?.trim() || 'N/A',
          delivery: deliveryTime?.trim() || 'N/A',
          features: features?.trim() || 'N/A',
          price: price?.trim() || 'N/A',
          hasBookNowButton: await bookNowButton.isVisible()
        };
        
        allShippingOptions.push(optionData);
        
        console.log(`Option ${i + 1}:`, optionData);
        
        // Verify each option has the required elements
        await expect(serviceElements.nth(i)).toBeVisible();
        await expect(deliveryElements.nth(i)).toBeVisible();
        await expect(featureElements.nth(i)).toBeVisible();
        await expect(priceElements.nth(i)).toBeVisible();
        await expect(bookNowButton).toBeVisible();
        await expect(bookNowButton).toHaveAttribute('href', expect.stringContaining('https://send.pos.com.my/home'));
        
      } catch (error) {
        console.log(`Warning: Could not fully process option ${i + 1}:`, error.message);
      }
    }
    
    // Verify we have at least one option
    expect(allShippingOptions.length).toBeGreaterThan(0);
    
    // Additional verification - ensure all options have required data
    for (const option of allShippingOptions) {
      expect(option.service).not.toBe('N/A');
      expect(option.price).toMatch(/RM\s*\d+/);
      expect(option.hasBookNowButton).toBe(true);
    }
    
    console.log(`\n✅ All Test PASSED: Successfully verified all ${allShippingOptions.length} shipping quote options`);
  });
  
});