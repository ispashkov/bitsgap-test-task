import {MAX_PROFIT_TARGETS} from "./constants";

export const formatProfitTargetButtonText = (profitTargetsCount: number): string => {
    return `Add profit target ${profitTargetsCount}/${MAX_PROFIT_TARGETS}`
}

export const toFixed = (number: number): string => {
    return number.toFixed(2)
}
