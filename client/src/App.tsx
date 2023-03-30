import { useState, useCallback, useEffect, useContext, Dispatch } from "react";
import "./App.css";
import Link from "./components/Link";
import { objectIsEmpty } from "./lib/utils";
import type { AccountData } from "./lib/types";
import AccountSection from "./components/AccountSection";
import TargetsContext, { type TargetAction } from "./context/TargetsContext";

function setInitialTargets(
  dispatch: Dispatch<TargetAction>,
  accounts: AccountData[],
  savedTargets: Record<string, number> | undefined
) {
  accounts.forEach((account) => {
    if (savedTargets) {
      console.log("saved");
      Object.entries(savedTargets).forEach(([symbol, target]) => {
        dispatch({
          type: "SET_TARGET",
          payload: {
            accountId: account.accountId,
            symbol,
            target,
          },
        });
      });
    } else {
      console.log("fresh");
      const holdingsCount = account.holdings.length;
      const evenSplit = Math.floor(100 / holdingsCount);
      // Since evenSplit may have been a fraction, "add" the difference to one of the splits
      const leftover = 100 - evenSplit * (holdingsCount - 1);
      account.holdings.forEach((h, i) => {
        const target = i === 0 ? leftover : evenSplit;
        dispatch({
          type: "SET_TARGET",
          payload: {
            accountId: account.accountId,
            symbol: h.tickerSymbol,
            target,
          },
        });
      });
    }
  });
}

function App() {
  const [linkToken, setLinkToken] = useState("");
  const [accountData, setAccountData] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(TargetsContext);

  const generateToken = useCallback(async (userId: string) => {
    const response = await fetch(
      `http://localhost:8080/plaid/create_link_token?user_id=${userId}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data.link_token;
  }, []);

  const getInvestmentData = useCallback(async (tokenId: string) => {
    const response = await fetch(
      `http://localhost:8080/plaid/get_investment_data?tokenId=${tokenId}`
    );
    const data = await response.json();
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      // first, try to get investment data, since we might already have an access token
      const tokenId = localStorage.getItem("tokenId");
      setLoading(true);
      if (tokenId) {
        const data = await getInvestmentData(tokenId);
        const savedTargets = localStorage.getItem("targets");
        const savedTargetObj = savedTargets
          ? JSON.parse(savedTargets)
          : undefined;
        setInitialTargets(dispatch, data, savedTargetObj);

        setAccountData(data);
      } else {
        const token = await generateToken("1");
        setLinkToken(token);
      }
      setLoading(false);
    })();
  }, [getInvestmentData, generateToken]);

  async function handleLinkSuccess(tokenId: string) {
    setLoading(true);
    const data = await getInvestmentData(tokenId);
    setAccountData(data);
    setLoading(false);
  }

  // useEffect(() => {
  //   (async () => {
  //     let token = "";
  //     //check for existing public token
  //     const savedUser = localStorage.getItem("user");
  //     const { userId } = savedUser
  //       ? JSON.parse(savedUser)
  //       : { userId: crypto.randomUUID() };

  //     token = await generateToken(userId);
  //     savedUser ?? localStorage.setItem("user", JSON.stringify({ userId }));
  //     setLinkToken(token);
  //   })();
  // }, [generateToken, setLinkToken]);

  const [targets, setTargets] = useState<Record<string, number>>({});

  let button;
  if (!loading && !objectIsEmpty(accountData)) {
    button = <button disabled>Connected to Account</button>;
  } else if (!loading && linkToken) {
    button = <Link linkToken={linkToken} onLinkSuccess={handleLinkSuccess} />;
  } else if (loading) {
    button = <button disabled>Loading...</button>;
  }

  return (
    <>
      <main>
        <h2>Investment Rebalancer</h2>
        {button}

        {/* <h5>Current Invested Balance: {accountData[0].invested}</h5>
        <h5>Current Uninvested Balance: {accountData[0].available}</h5>
        <h5>Total Account Balance: {accountData[0].balance}</h5> */}
        <table>
          <tbody>
            <tr>
              <th>Security</th>
              <th>Invested Amount</th>
              <th>Current Percentage</th>
              <th>Target Percentage</th>
              <th>Target Amount</th>
              <th>Amount To Invest</th>
            </tr>
            {accountData.map((account) => {
              return (
                <AccountSection
                  account={account}
                  key={account.accountId}
                ></AccountSection>
              );
              // return account.holdings.map((h, i) => {
              //   const percent = ((h.value / account.invested) * 100).toFixed(2);
              //   const targetBalance =
              //     account.balance * (targets[h.tickerSymbol] / 100);
              //   return (
              //     <tr key={i}>
              //       <td>{h.tickerSymbol}</td>
              //       <td>{h.value}</td>
              //       <td>{percent}</td>
              //       <td>
              //         <input
              //           onChange={(e) => {
              //             setTargets({
              //               ...targets,
              //               [h.tickerSymbol]: parseInt(e.target.value),
              //             });
              //           }}
              //           value={targets[h.tickerSymbol]}
              //         ></input>
              //       </td>
              //       <td>{targetBalance.toFixed(2)}</td>
              //       <td>{(targetBalance - h.value).toFixed(2)}</td>
              //     </tr>
              //   );
              // });
            })}
          </tbody>
        </table>
      </main>
    </>
  );
}

export default App;
