import { TEST_CHAINS } from '../../../shared/constants/network';
import migration76 from './076';

describe('migration #76', () => {
  it('should update the version metadata', async () => {
    const oldStorage = {
      meta: {
        version: 75,
      },
      data: {},
    };

    const newStorage = await migration76.migrate(oldStorage);
    expect(newStorage.meta).toStrictEqual({
      version: 76,
    });
  });

  it('should update the advancedGasFee object', async () => {
    const oldStorage = {
      meta: {},
      data: {
        PreferencesController: {
          advancedGasFee: {
            maxBaseFee: 10,
            priorityFee: 10,
          },
        },
        NetworkController: {
          provider: {
            chainId: TEST_CHAINS[0],
          },
        },
      },
    };

    const newStorage = await migration76.migrate(oldStorage);
    const newAdvancedGasFee = {
      '0x5': {
        maxBaseFee: 10,
        priorityFee: 10,
      },
    };
    expect(newStorage.data.PreferencesController.advancedGasFee).toStrictEqual(
      newAdvancedGasFee,
    );
  });
});
