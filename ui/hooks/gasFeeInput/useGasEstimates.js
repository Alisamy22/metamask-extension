import { useSelector } from 'react-redux';

import {
  EDIT_GAS_MODES,
  GAS_ESTIMATE_TYPES,
} from '../../../shared/constants/gas';
import {
  getMaximumGasTotalInHexWei,
  getMinimumGasTotalInHexWei,
} from '../../../shared/modules/gas.utils';

import { checkNetworkAndAccountSupports1559 } from '../../selectors';
import { decGWEIToHexWEI } from '../../helpers/utils/conversions.util';
import { isLegacyTransaction } from '../../helpers/utils/transactions.util';

import { decimalToHex } from '../../../shared/lib/transactions-controller-utils';

/**
 * @typedef {object} GasEstimatesReturnType
 * @property {string} [estimatedMinimumFiat] - The amount estimated to be paid
 *  based on current network conditions. Expressed in user's preferred currency.
 * @property {string} [estimatedMaximumFiat] - the maximum amount estimated to be paid if current
 *  network transaction volume increases. Expressed in user's preferred currency.
 * @property {string} [estimatedMaximumNative] - the maximum amount estimated to be paid if the
 *  current network transaction volume increases. Expressed in the network's native currency.
 * @property {string} [estimatedMinimumNative] - the maximum amount estimated to be paid if the
 *  current network transaction volume increases. Expressed in the network's native currency.
 * @property {HexWeiString} [estimatedBaseFee] - estimatedBaseFee from fee-market gasFeeEstimates
 *  in HexWei.
 * @property {HexWeiString} [minimumCostInHexWei] - the minimum amount this transaction will cost.
 */

/**
 * @param options
 * @param options.editGasMode
 * @param options.gasEstimateType
 * @param options.gasFeeEstimates
 * @param options.gasLimit
 * @param options.gasPrice
 * @param options.maxFeePerGas
 * @param options.maxPriorityFeePerGas
 * @param options.minimumGasLimit
 * @param options.transaction
 * @returns {GasEstimatesReturnType} The gas estimates.
 */
export function useGasEstimates({
  editGasMode,
  gasEstimateType,
  gasFeeEstimates,
  gasLimit,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  minimumGasLimit,
  transaction,
}) {
  const supportsEIP1559 =
    useSelector(checkNetworkAndAccountSupports1559) &&
    !isLegacyTransaction(transaction?.txParams);

  // We have two helper methods that take an object that can have either
  // gasPrice OR the EIP-1559 fields on it, plus gasLimit. This object is
  // conditionally set to the appropriate fields to compute the minimum
  // and maximum cost of a transaction given the current estimates or selected
  // gas fees.
  let gasSettings = {
    gasLimit: decimalToHex(gasLimit),
  };
  if (supportsEIP1559) {
    gasSettings = {
      ...gasSettings,
      maxFeePerGas: decGWEIToHexWEI(maxFeePerGas || gasPrice || '0'),
      maxPriorityFeePerGas: decGWEIToHexWEI(
        maxPriorityFeePerGas || maxFeePerGas || gasPrice || '0',
      ),
      baseFeePerGas: decGWEIToHexWEI(gasFeeEstimates.estimatedBaseFee ?? '0'),
    };
  } else if (gasEstimateType === GAS_ESTIMATE_TYPES.NONE) {
    gasSettings = {
      ...gasSettings,
      gasPrice: '0x0',
    };
  } else {
    gasSettings = {
      ...gasSettings,
      gasPrice: decGWEIToHexWEI(gasPrice),
    };
  }

  // The maximum amount this transaction will cost
  const maximumCostInHexWei = getMaximumGasTotalInHexWei(gasSettings);

  if (editGasMode === EDIT_GAS_MODES.SWAPS) {
    gasSettings = { ...gasSettings, gasLimit: minimumGasLimit };
  }

  // The minimum amount this transaction will cost
  const minimumCostInHexWei = getMinimumGasTotalInHexWei(gasSettings);

  return {
    estimatedBaseFee: supportsEIP1559
      ? decGWEIToHexWEI(gasFeeEstimates.estimatedBaseFee ?? '0')
      : undefined,
    maximumCostInHexWei,
    minimumCostInHexWei,
  };
}
