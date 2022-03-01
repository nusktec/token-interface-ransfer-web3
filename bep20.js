//snippet transfer
const sendTokenBEB20 = async (addr, amt) => {
    try {
        //unlock account
        const _account = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
        //check account address
        console.log("unlocked address: ", _account.address);
        let abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));
        let wallet = process.env.ADDRESS;
        let count = await web3.eth.getTransactionCount(wallet);
        console.log(count);
        let contract = new web3.eth.Contract(abiArray, process.env.CONTRACT, {from: wallet});
        let balance = await contract.methods.balanceOf(wallet).call();
        console.log("balance_" + balance);
        const gasLimit = await contract.methods.transfer(addr, amt*(1e9)).estimateGas({from: wallet});
        let gas = String(Math.floor(web3.utils.fromWei(String(balance), 'ether') / web3.utils.fromWei(String(gasLimit), 'gwei')));
        console.log("Gas Limit", gasLimit," ",gas);
        return await contract.methods.transfer(addr, amt * (1e9)).send({
            from: wallet,
            chanid: 56,
            gas: gasLimit,
            gasPrice: web3.utils.toWei(Math.ceil((gas / 6)).toString(), 'gwei'),
            nonce: count
        });
    } catch (e){
        //console.log(e);
        return false;
    }
};


const EnthereumInterface = async (_addr, amountUnit) => {
    // This code was written and tested using web3 version 1.0.0-beta.26
    console.log(`web3 version: ${web3.version}`);

    // Who holds the token now?
    let myAddress = process.env.ADDRESS;

    // Who are we trying to send this token to?
    let destAddress = _addr;

    // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
    let transferAmount = amountUnit;

    // Determine the nonce
    let count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);

    // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
    let abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));

    // This is the address of the contract which created the ERC20 token
    let contractAddress = process.env.CONTRACT;

    let contract = new web3.eth.Contract(abiArray, contractAddress, {from: myAddress});

    // How many tokens do I have before sending?
    let balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance before send: ${balance}`);
    //const blk = await web3.eth.getBlock('latest');
    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    let rawTransaction = {
        "from": myAddress,
        "nonce": web3.utils.toHex(count + 0),
        "gasPrice": 20e9,
        "gasLimit": 25e6,
        "to": contractAddress,
        "value": "0x0",
        "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
        "chainId": 0x38
    };
    // The private key must be for myAddress
    let privKey = new Buffer.from(process.env.PRIVATE_KEY, 'hex');
    console.log(privKey);
    let tx = new Tx(rawTransaction);
    tx.sign(privKey);
    let serializedTx = tx.serialize();
    // Comment out these three lines if you don't really want to send the TX right now
    console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);
    let receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

    // The balance may not be updated yet, but let's check
    balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance after send: ${balance}`);
};
