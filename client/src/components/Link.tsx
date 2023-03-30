import { useCallback, useEffect, useState } from "react";
import {
  usePlaidLink,
  type PlaidLinkOptions,
  type PlaidLinkOnSuccess,
} from "react-plaid-link";

function Link({
  linkToken,
  onLinkSuccess,
}: {
  linkToken: string;
  onLinkSuccess: (tokenId: string) => void;
}) {
  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      const result = await fetch(
        "http://localhost:8080/plaid/exchange_public_token",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ public_token }),
        }
      );
      const data = await result.json();
      localStorage.setItem("tokenId", data.accessTokenId);
      onLinkSuccess(data.accessTokenId);
    },
    []
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  } as PlaidLinkOptions);

  return (
    <button
      onClick={() => {
        console.log("hello?");
        open();
      }}
    >
      Connect to Account
    </button>
  );
}

export default Link;
