import { createContext, Dispatch, ReactNode, useReducer } from "react";

type AccountId = string;
type TicketSymbol = string;
type Target = number;
type TargetState = Record<
  AccountId,
  Record<TicketSymbol, Target> | Dispatch<TargetAction>
>;

// interface TargetsState {
//   [accountId: string] : {
//     [symbol: string]: number
//   }
// };

type SetTargetAction = {
  type: "SET_TARGET";
  payload: {
    accountId: string;
    symbol: string;
    target: number;
  };
};

export type TargetAction = SetTargetAction;

interface TargetsContext extends TargetState {
  dispatch: Dispatch<TargetAction>;
}

const initialState = {};
const Context = createContext<TargetsContext>(initialState as TargetsContext);

const { Provider } = Context;

export function TargetsProvider({ children }: { children: ReactNode }) {
  function reducer(
    state: TargetState,
    { type, payload }: TargetAction
  ): TargetState {
    switch (type) {
      case "SET_TARGET": {
        const account = state[payload.accountId];
        const updatedAccount = { ...account, [payload.symbol]: payload.target };
        return { ...state, [payload.accountId]: updatedAccount };
      }
      default:
        return { ...state };
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  return <Provider value={{ ...state, dispatch }}>{children}</Provider>;
}

export default Context;
