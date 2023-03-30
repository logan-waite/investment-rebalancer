import { useContext, useEffect } from "react";
import TargetsContext from "../context/TargetsContext";
import { AccountData } from "../lib/types";

function saveTargetToLocal(symbol: string, target: string) {
  const saved = localStorage.getItem("targets");
  if (saved) {
    const targets = JSON.parse(saved);
    const updated = { ...targets, [symbol]: parseInt(target) };
    localStorage.setItem("targets", JSON.stringify(updated));
  } else {
    localStorage.setItem(
      "targets",
      JSON.stringify({ [symbol]: parseInt(target) })
    );
  }
}

function AccountSection({ account }: { account: AccountData }) {
  const targetsContext = useContext(TargetsContext);
  const { dispatch } = targetsContext;
  const targets = targetsContext[account.accountId] as Record<string, number>;

  const holdingRows = account.holdings.map((h, i) => {
    const percent = ((h.value / account.invested) * 100).toFixed(2);
    const targetBalance = account.balance * (targets[h.tickerSymbol] / 100);
    return (
      <tr key={i}>
        <td>{h.tickerSymbol}</td>
        <td>{h.value}</td>
        <td>{percent}</td>
        <td>
          <input
            onBlur={(e) => saveTargetToLocal(h.tickerSymbol, e.target.value)}
            onChange={(e) => {
              dispatch({
                type: "SET_TARGET",
                payload: {
                  accountId: account.accountId,
                  symbol: h.tickerSymbol,
                  target: Number(e.target.value),
                },
              });
            }}
            value={targets[h.tickerSymbol]}
          ></input>
        </td>
        <td>{targetBalance.toFixed(2)}</td>
        <td>{(targetBalance - h.value).toFixed(2)}</td>
      </tr>
    );
  });

  return (
    <>
      <tr>
        <td>{account.name}</td>
      </tr>
      {holdingRows}
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td>Total: {Object.values(targets).reduce((sum, v) => sum + v)}</td>
      </tr>
    </>
  );
}

export default AccountSection;
