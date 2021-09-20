import { observable, computed, action } from "mobx";
import { nanoid } from "nanoid";

import {
  Errors,
  OrderSide,
  ProfitTarget,
  ProfitTargetFieldUpdated
} from "../model";
import {AMOUNT_TO_PROFIT, MAX_PROFIT_TARGETS, PROFIT_STEP} from "../constants";

export class PlaceOrderStore {
  @observable activeOrderSide: OrderSide = "buy";
  @observable price: number = 0;
  @observable amount: number = 0;
  @observable takeProfitIsOn: boolean = false;
  @observable profitTargets: Array<ProfitTarget> = [];

  @computed get total(): number {
    return this.price * this.amount;
  }

  @action.bound
  public setOrderSide(side: OrderSide) {
    this.activeOrderSide = side;
  }

  @action.bound
  public setPrice(price: number) {
    this.price = price;
  }

  @action.bound
  public setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  public setTotal(total: number) {
    this.amount = this.price > 0 ? total / this.price : 0;
  }

  @action.bound
  public setTakeProfit(value?: boolean) {
    this.takeProfitIsOn = value || false

    if (value) {
      this.profitTargets = [];
      this.profitTargets.push(this.newProfitTarget())
    }
  }

  @computed get totalProfit(): number {
    return this.profitTargets.reduce((acc, it) => {
      const price = it.price - this.price
      const amount = this.amount * it.amount * 0.01
      const multiply = this.activeOrderSide === "buy" ? 1 : -1

      return price * amount * multiply + acc;
    }, 0)
  }

  @computed get isMaxProfitTargets(): boolean {
    return this.profitTargets.length >= MAX_PROFIT_TARGETS
  }

  @action.bound
  public addProfitTarget() {
    this.profitTargets.push(this.newProfitTarget())
  }

  @action.bound
  public removeProfitTarget(id: string) {
    this.profitTargets = this.profitTargets.filter((profitTarget: ProfitTarget) => profitTarget.id !== id)
  }

  @action.bound
  private newProfitTarget = (): ProfitTarget => {
    const lastItem = this.profitTargets[this.profitTargets.length - 1];
    const profit = !!lastItem ? (lastItem.profit + PROFIT_STEP) : PROFIT_STEP;

    return {
      id: nanoid(),
      profit,
      price: this.newPrice(profit),
      amount: AMOUNT_TO_PROFIT,
    }
  }

  @action.bound
  public updateProfitTargets() {
    this.profitTargets = this.profitTargets.map((profitTarget: ProfitTarget) => {
      return { ...profitTarget, price: this.newPrice(profitTarget.profit) };
    });
  }

  @action.bound
  private newPrice = (profit: number): number => {
    return this.price + this.price * profit * 0.01;
  }

  @action.bound
  private newProfit(price: number): number {
    return this.price ? +(((price - this.price) / this.price) * 100) : 0;
  }

  @action.bound
  public updateField(
      id: string,
      field: ProfitTargetFieldUpdated,
      value?: number | null
  ) {

    if (!!value || value === 0 || value === null) {
      this.updateFieldById(id, field, Number(value))
    }

    const profitTarget = this.profitTargets.find((profitTarget: ProfitTarget) => profitTarget.id === id)

    switch (field) {
      case 'profit':
        this.updateFieldById(id, field, this.newProfit(profitTarget?.price || 0))
        break
      case 'price':
        this.updateFieldById(id, field, this.newPrice(profitTarget?.profit || 0))
        break
    }
  }

  @action.bound
  private updateFieldById(id: string, field: ProfitTargetFieldUpdated, value: number | null): void {
    this.profitTargets = this.profitTargets.map(({errors, ...profitTarget}: ProfitTarget) => {
      if (profitTarget.id === id) {
        return { ...profitTarget, [field]: value };
      }

      return profitTarget;
    });
  }

  @action.bound
  public validate(): void {
    let totalProfit: number = 0;
    let previousProfit: number = 0;
    let totalAmount: number = 0;

    this.profitTargets = this.profitTargets.map((profitTarget: ProfitTarget) => {
      const draft = {
        ...profitTarget,
        errors: {
          ...(profitTarget.errors || {}),
        },
      }

      if (draft.profit <= previousProfit) {
        draft.errors.profit = Errors.MinProfitValue
      }

      if (draft.price <= 0) {
        draft.errors.price = Errors.MinTradePrice
      }

      if (draft.profit < 0.01) {
        draft.errors.profit = Errors.TargetProfit
      }

      totalAmount += profitTarget.amount;
      totalProfit += profitTarget.profit;
      previousProfit = profitTarget.profit;

      return draft
    });

    if (totalProfit > 500) {
      this.profitTargets = this.profitTargets.map((profitTarget: ProfitTarget) => ({
        ...profitTarget,
        errors: {
          ...(profitTarget.errors || {}),
          profit: Errors.MaxProfitSum,
        },
      }));
    }

    if (totalAmount > 100) {
      this.profitTargets = this.profitTargets.map((profitTarget: ProfitTarget) => ({
        ...profitTarget,
        errors: {
          ...(profitTarget.errors || {}),
          amount: `${totalAmount} ${Errors.OutOfArea} ${totalAmount - 100}`,
        },
      }));
    }
  }
}
