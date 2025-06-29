import { test, expect } from '@playwright/test';

test('has title1', async ({ page }) => {
  await page.goto('https://hhs.fuhsd.org/student-portal');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Student Portal - Homestead High School/);
});