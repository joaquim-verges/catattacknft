import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractEvents,
  useOwnedNFTs,
  Web3Button,
  ThirdwebNftMedia,
  useSDK,
} from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Address } from "../components/address";

const CONTRACT_ADDR = "0xb2B1701cAAd6B933150F88217845bC3D045DC3D1";

const Home: NextPage = () => {
  // contract data
  const address = useAddress();
  const { contract } = useContract(CONTRACT_ADDR);
  const { data: nfts, isLoading } = useOwnedNFTs(contract, address);
  const hasNothing = nfts?.length === 0;
  const hasLevel1 = nfts?.some((nft) => nft.metadata.id === "0");
  const hasLevel2 = nfts?.some((nft) => nft.metadata.id === "1");
  const hasLevel3 = nfts?.some((nft) => nft.metadata.id === "2");
  const totalPoints = nfts?.reduce(
    (prev, curr) =>
      prev + ((curr.quantityOwned || 0) * Number(curr.metadata.id) + 1),
    0
  );

  const sdk = useSDK();

  useEffect(() => {
    if (sdk && address) {
      sdk
        .getContractList("0xa2B7958A3883DA45916f7710B42B0e4Ba816E825")
        .then(console.log);
    }
  }, [sdk, address]);

  // events
  const events = useContractEvents(contract);
  const myEvents = events.data
    ?.filter(
      (event) => event.eventName === "LevelUp" || event.eventName === "Miaowed"
    )
    .slice(0, 20);

  // state
  const [transferTo, setTransferTo] = useState<string>("");
  const [error, setError] = useState<string>("");
  return (
    <div style={{ width: 650, margin: "auto" }}>
      <div style={{ width: 300 }}>
        <ConnectWallet />
      </div>
      {address ? (
        <>
          <h2 style={{ paddingBottom: 0 }}>Cats you currently own </h2>
          {hasNothing && <p>You don&apos;t have any cats!</p>}
          {nfts &&
            nfts.map((nft) => (
              <div key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia metadata={nft.metadata} width="320px" />
                <h3>
                  {nft.metadata.name} - {nft.metadata.description} (x
                  {nft.quantityOwned})
                </h3>
              </div>
            ))}
          {totalPoints && totalPoints > 0 ? (
            <h3 style={{ color: "grey" }}>Total Points: {totalPoints}</h3>
          ) : undefined}
          <hr />
          {hasNothing && (
            <>
              <h2>Claim your kitten to start playing</h2>
              <Web3Button
                contractAddress={CONTRACT_ADDR}
                accentColor="green"
                action={(contract) => contract.call("claimKitten")}
                onError={(error) => setError(error.message)}
                onSubmit={() => setError("")}
              >
                Claim
              </Web3Button>
            </>
          )}
          {hasLevel1 && !hasLevel2 && (
            <>
              <h2>Send your cat to someone else</h2>
              <input
                onChange={(event) => setTransferTo(event.target.value)}
                value={transferTo}
                style={{
                  width: "620px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />
              <Web3Button
                contractAddress={CONTRACT_ADDR}
                action={(contract) => {
                  contract.erc1155.transfer(transferTo, 0, 1);
                }}
                accentColor="green"
                onError={(error) => setError(error.message)}
                onSubmit={() => setError("")}
              >
                Transfer
              </Web3Button>
            </>
          )}
          {hasLevel2 && (
            <>
              <h2>Ascend to ninja status</h2>
              <Web3Button
                contractAddress={CONTRACT_ADDR}
                action={(contract) => contract.erc1155.burn(1, 1)}
                accentColor="red"
                onError={(error) => setError(error.message)}
                onSubmit={() => setError("")}
              >
                Burn it
              </Web3Button>
            </>
          )}
          {hasLevel3 && (
            <>
              <h2>Attack another cat!</h2>
              <input
                onChange={(event) => setTransferTo(event.target.value)}
                value={transferTo}
                style={{
                  width: "620px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />
              <Web3Button
                contractAddress={CONTRACT_ADDR}
                action={(contract) => contract.call("attack", transferTo)}
                onSubmit={() => setError("")}
                onError={(error) => setError(error.message)}
              >
                Attack
              </Web3Button>
            </>
          )}
        </>
      ) : (
        <h2>Connect your wallet to get started</h2>
      )}
      {error && <h3 style={{ color: "red" }}>{error}</h3>}
      {isLoading && <h3>Loading...</h3>}
      <hr />
      <h2>Game Events</h2>
      {myEvents && myEvents?.length > 0
        ? myEvents?.map((event) => {
            if (event.eventName == "LevelUp") {
              return (
                <h4
                  key={`${event.transaction.transactionHash}_${event.transaction.logIndex}`}
                  style={{ color: "grey" }}
                >
                  ????{" "}
                  <Address
                    address={event.data.account as string}
                    setText={setTransferTo}
                  />{" "}
                  leveled up to{" "}
                  {getLevelName((event.data.level as BigNumber).toNumber())}
                </h4>
              );
            }
            if (event.eventName == "Miaowed") {
              return (
                <h4
                  key={`${event.transaction.transactionHash}_${event.transaction.logIndex}`}
                  style={{ color: "red" }}
                >
                  ??????{" "}
                  <Address
                    address={event.data.attacker as string}
                    setText={setTransferTo}
                  />{" "}
                  just destroyed{" "}
                  <Address
                    address={event.data.victim as string}
                    setText={setTransferTo}
                  />{" "}
                  {getLevelName((event.data.level as BigNumber).toNumber())}
                </h4>
              );
            }
          })
        : "No events yet"}
      <hr />
      <h4>
        <a href="https://faucet.paradigm.xyz/">Get testnet funds</a>
      </h4>
      <h4>
        Deploy your own{" "}
        <a href="https://thirdweb.com/joenrv.eth/CatAttackNFT">
          CatAttack contract
        </a>
      </h4>
      <h4>
        Check out the code on{" "}
        <a href="https://github.com/joaquim-verges/catattacknft">Github</a>
      </h4>
      <h4>
        Created by <a href="https://twitter.com/joenrv">joenrv.eth</a>
      </h4>
    </div>
  );
};

export function getLevelName(level: number) {
  switch (level) {
    case 1:
      return <span style={{ color: "orange" }}>???? Kitten</span>;
    case 2:
      return <span style={{ color: "green" }}>???? Grumpy Cat</span>;
    case 3:
      return <span style={{ color: "black" }}>???? Ninja Cat</span>;
  }
}

export default Home;
