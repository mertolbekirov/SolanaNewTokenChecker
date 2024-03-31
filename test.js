const { Connection, PublicKey } = require("@solana/web3.js");
const { Metaplex } = require("@metaplex-foundation/js");

// Your HTTPS and WSS URLs for the Solana Mainnet endpoint from QuickNode
const httpUrl = "https://virulent-multi-hill.solana-mainnet.quiknode.pro/cf6b15be2ab499a13ebba3eb69900973ad4a097d/";
const wssUrl = "wss://virulent-multi-hill.solana-mainnet.quiknode.pro/cf6b15be2ab499a13ebba3eb69900973ad4a097d/";

// Connection object initialization with additional httpHeaders
const connection = new Connection(httpUrl, {
  wsEndpoint: wssUrl,
  httpHeaders: {"x-session-hash": "SESSION_HASH"} // Make sure to replace SESSION_HASH with your actual session hash
});

const metaplex = Metaplex.make(connection);

// The mint address you are interested in
var mintAddress = new PublicKey('2kKTKcz43QM18UPRSzGmmqUPi8fSigTS5GrRMLELJaZr');

// Wrap your async logic in an async function
async function main() {

    let tokenName;
    let tokenSymbol;
    let tokenLogo;

    const metadataAccount = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: mintAddress });

    const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

    if (metadataAccountInfo) {
          const token = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
          tokenName = token.name;
          tokenSymbol = token.symbol;
          tokenLogo = token.json.image;
          console.log(token)
    }

}

main().catch(console.error); // Call the async function and catch any errors
