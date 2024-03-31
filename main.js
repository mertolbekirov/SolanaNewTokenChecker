const { Connection, PublicKey } = require("@solana/web3.js");
const { Metaplex } = require("@metaplex-foundation/js");

const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";

const SESSION_HASH = 'QNDEMO' + Math.ceil(Math.random() * 1e9); // Random unique identifier for your session
let credits = 0;

const raydium = new PublicKey(RAYDIUM_PUBLIC_KEY);
// Replace HTTP_URL & WSS_URL with QuickNode HTTPS and WSS Solana Mainnet endpoint
const connection = new Connection(`HTTP_URL`, {
    wsEndpoint: `WSS_URL`,
    httpHeaders: { "x-session-hash": SESSION_HASH }
});

const connection2 = new Connection(`https://api.mainnet-beta.solana.com`);

const metaplex = Metaplex.make(connection2);


// Monitor logs
async function main(connection, programAddress) {
    console.log("Monitoring logs for program:", programAddress.toString());
    connection.onLogs(
        programAddress,
        ({ logs, err, signature }) => {
            if (err) return;

            if (logs && logs.some(log => log.includes("initialize2"))) {
                console.log("Signature for 'initialize2':", signature);
                fetchRaydiumAccounts(signature, connection);
            }
        },
        "finalized"
    );
}

// Parse transaction and filter data
async function fetchRaydiumAccounts(txId, connection) {
    const tx = await connection.getParsedTransaction(
        txId,
        {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

    credits += 100;

    const accounts = tx?.transaction.message.instructions.find(ix => ix.programId.toBase58() === RAYDIUM_PUBLIC_KEY).accounts;

    if (!accounts) {
        console.log("No accounts found in the transaction.");
        return;
    }

    const tokenAIndex = 8;
    const tokenBIndex = 9;


    //tokenAAccount in the case of Raydium initialize2 tx is the mint address of the newly craeted token
    const tokenAAccount = accounts[tokenAIndex];
    const tokenBAccount = accounts[tokenBIndex];

    const displayData = [
        { "Token": "A", "Account Public Key": tokenAAccount.toBase58() },
        { "Token": "B", "Account Public Key": tokenBAccount.toBase58() }
    ];
    console.table(displayData);

    var mintAddress = new PublicKey(tokenAAccount.toBase58());

    const metadataAccount = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: mintAddress });

    const metadataAccountInfo = await connection2.getAccountInfo(metadataAccount);

    let tokenName;
    let tokenSymbol;

    if (metadataAccountInfo) {
        const token = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
        tokenName = token.name;
        tokenSymbol = token.symbol;
    }

    console.log("New LP Found");
    console.log(generateExplorerUrl(txId));
    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol)
    console.log("Total QuickNode Credits Used in this session:", credits);
}

function generateExplorerUrl(txId) {
    return `https://solscan.io/tx/${txId}`;
}

main(connection, raydium).catch(console.error);