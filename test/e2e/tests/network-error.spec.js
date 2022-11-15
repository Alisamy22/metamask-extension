const { strict: assert } = require('assert');
const { convertToHexValue, withFixtures } = require('../helpers');
const FixtureBuilder = require('../fixture-builder');

describe('Gas API fallback', function () {
  const ganacheOptions = {
    hardfork: 'london',
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };

  it('error message is displayed but gas recommendation is not displayed', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().withNetworkCongestion().build(),
        testSpecificMock: mockGasApiDown,
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('[data-testid="eth-overview-send"]');

        await driver.fill(
          'input[placeholder="Search, public address (0x), or ENS"]',
          '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        );

        const inputAmount = await driver.findElement('.unit-input__input');
        await inputAmount.fill('1');

        await driver.clickElement({ text: 'Next', tag: 'button' });

        const error1 = await driver.isElementPresent(
          '.actionable-message__message',
        );

        const error = await driver.isElementPresent({
          text: 'Network is busy. Gas prices are high and estimates are less accurate.',
          tag: 'div',
        });

        assert.equal(error1, true, 'Network error is present');
        assert.equal(error, true, 'Network error is present');
      },
    );
  });
});
