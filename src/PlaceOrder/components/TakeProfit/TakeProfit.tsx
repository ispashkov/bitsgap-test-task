/* eslint @typescript-eslint/no-use-before-define: 0 */

import React from "react";
import block from "bem-cn-lite";
import { AddCircle, Cancel } from "@material-ui/icons";

import { Switch, TextButton, NumberInput } from "components";

import { QUOTE_CURRENCY } from "../../constants";
import {OrderSide, ProfitTarget} from "../../model";
import "./TakeProfit.scss";
import {formatProfitTargetButtonText} from "../../format";
import {observer} from "mobx-react";
import {useStore} from "../../context";

type Props = {
  orderSide: OrderSide;
};

const b = block("take-profit");

const TakeProfit = observer(({ orderSide }: Props) => {
    const {
        takeProfitIsOn,
        setTakeProfit,
        profitTargets,
        isMaxProfitTargets,
        addProfitTarget,
        removeProfitTarget,
        totalProfit,
        updateField,
        updateProfitTargets,
        price
    } = useStore();

    React.useEffect(updateProfitTargets, [updateProfitTargets, price])

    return (
        <div className={b()}>
            <div className={b("switch")}>
                <span>Take profit</span>
                <Switch checked={takeProfitIsOn} onChange={setTakeProfit} />
            </div>
            {takeProfitIsOn && (
                <div className={b("content")}>
                    {renderTitles()}
                    {renderInputs()}
                    {!isMaxProfitTargets && (
                        <TextButton className={b("add-button")} onClick={addProfitTarget}>
                            <AddCircle className={b("add-icon")} />
                            <span>{formatProfitTargetButtonText(profitTargets.length)}</span>
                        </TextButton>
                    )}
                    <div className={b("projected-profit")}>
                        <span className={b("projected-profit-title")}>Projected profit</span>
                        <span className={b("projected-profit-value")}>
                        <span>{totalProfit}</span>
                        <span className={b("projected-profit-currency")}>
                          {QUOTE_CURRENCY}
                        </span>
                    </span>
                    </div>
                </div>
            )}
        </div>
    );
    function renderInputs() {
        return (
            <>
                {profitTargets.map(({ id, profit, amount, price, errors}: ProfitTarget) => (
                    <div key={id} className={b("inputs")}>
                        <NumberInput
                            value={profit}
                            decimalScale={2}
                            InputProps={{ endAdornment: "%" }}
                            variant="underlined"
                            onChange={(value: number) => updateField(id, 'profit', value)}
                            onBlur={() => updateField(id, 'price')}
                            error={errors?.profit}
                        />
                        <NumberInput
                            value={price}
                            decimalScale={2}
                            InputProps={{ endAdornment: QUOTE_CURRENCY }}
                            variant="underlined"
                            onChange={(value: number) => updateField(id, 'price', value)}
                            onBlur={(value: number) => updateField(id, 'price', value)}
                            error={errors?.price}
                        />
                        <NumberInput
                            value={amount}
                            decimalScale={2}
                            InputProps={{ endAdornment: "%" }}
                            variant="underlined"
                            onChange={(value: number) => updateField(id, 'amount', value)}
                            onBlur={(value: number) => updateField(id, 'amount', value)}
                            error={errors?.amount}
                        />
                        <div className={b("cancel-icon")}>
                            <Cancel onClick={() => removeProfitTarget(id)} />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    function renderTitles() {
        return (
            <div className={b("titles")}>
                <span>Profit</span>
                <span>Target price</span>
                <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
            </div>
        );
    }
});

export { TakeProfit };
