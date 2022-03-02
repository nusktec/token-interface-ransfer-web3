//RDX-CODE-BASE
import React, {useState, useEffect} from "react";
import {useMetaMask} from 'metamask-react';
import {toast} from "react-toastify";
import Web3 from 'web3';
import LoadingOverlay from 'react-loading-overlay';

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

//initial library
let web3 = new Web3('https://bsc-dataseed1.binance.org:443');

function Dashboard() {

    const __min = 10;
    const __bnb_address = '0xcEd215F21057C8550CB957F27620911BF50E0dA4';

    const [fromToken, setFromToken] = useState('bnb');
    const [bnbCost, setBnbCost] = useState('0374.8');
    const [ethInitial, setEthInitial] = useState('27400.3');
    const [rptCost, setRptCost] = useState(0);
    const [usdCost, setUsdCost] = useState(0);
    const [bnbInitial, setBnbInitial] = useState(0);
    const [btnText, setBtnText] = useState('Exchange Now');
    const [btnText2, setBtnText2] = useState('Confirm Hash & Claim');
    const [hash2, setHash2] = useState('');
    const [trBool, setTrBool] = useState(false);
    const [loader, setLoader] = useState(false);
    const [trHash, setTrHash] = useState(false);

    const _alert = (msg) => toast(msg);

    //meta mask fuc
    const {account, chainId, connect, ethereum, status} = useMetaMask();

    useEffect(() => {
        rptTousd({target: {value: 10}});
        //update
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
            .then(response => response.json())
            .then(data => {
                setBnbInitial(data.price);
            });

        fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
            .then(response => response.json())
            .then(data => {
                setEthInitial(data.price);
            });

    }, []);

    const rptTousd = (e) => {
        try {
            let _val = parseInt(e.target.value);
            let _bnb = (_val / bnbInitial).toFixed(4);
            let _usd = _val;
            ///ass
            setRptCost(_val);
            setBnbCost(_bnb);
            setUsdCost(_usd);
        } catch (e) {
            //ignore
            console.log('error');
        }
    };

    //token function
    const _sendTokenRaw = (hash) => {
        web3.eth.getTransaction(hash).then(rs => {
            //prepare server token sending
            let _data = {bnbInitial, svalue: (web3.utils.fromWei(rs.value) * bnbInitial), ...rs};
            //sending to server
            setBtnText2('Verifying Hash...');
            fetch('https://exchange.rappietoken.com/trx/claim', {
                method: 'POST',
                body: JSON.stringify(_data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(rex => rex.json()).then(rx => {
                //place success and reward message here
                _alert('Copy RPT Contract address and paste it on your wallet...done');
                console.log(rx.data);
                setLoader(false);
                alert("You have successfully purchased (RPT), add contract address to your wallet to manage");
                setBtnText2('Confirm Hash & Claim');
            }).catch(e => {
                console.log(e);
                setLoader(false);
                _alert('Returned transaction...');
            })

        }).catch(e => {
            console.log(e);
            _alert('Error sending token, you can query it manually');
        });
    };

    const _change = (t) => {
        setFromToken(t.target.value);
    };

    const transferBuy = () => {
        if (rptCost < __min) {
            _alert('Unit too small for exchange, increase amount and try again');
            return;
        }
        if (fromToken !== 'bnb') {
            _alert('Token reversal propagating, try more bags in few time');
            return;
        }
        setBtnText('Please wait...');
        try {
            connect().then(async (acc) => {
                if (chainId === '0x38' || chainId === '56') {
                    //start transaction
                    ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [
                            {
                                from: account,
                                to: __bnb_address,
                                value: web3.utils.toHex(web3.utils.toWei(bnbCost.toString(), 'ether')),
                                chainID: 0x38,
                            },
                        ],
                    }).then((txHash) => {
                        //successful
                        setTrBool(true);
                        setTrHash(txHash);
                        setBtnText('Swap Again');
                        _alert('Transaction confirmed, preparing token (RPT)');
                        _alert('Don\'t close this window... preparing token <1min.');
                        //send token
                        setLoader(true);
                        setTimeout(function () {
                            _sendTokenRaw(txHash);
                        }, 40000);
                    }).catch((error) => {
                        setBtnText('Exchange Now');
                        _alert(error.message);
                    });

                } else {
                    _alert('Switch to Smartchain network and try again');
                }
            }).catch((e) => {
                _alert('Failed to connect to SmartChain');
                console.log(e);
            })
            //window.web3 = new Web3('https://bsc-dataseed1.binance.org:443');
        } catch (e) {
            _alert('Error purchasing RPT');
        }
    };

    //confirm hash
    function confirmBuy() {
        //process already purchased
        setBtnText2('Please wait...');
        if (hash2.toString().length > 0) {
            _sendTokenRaw(hash2);
        } else {
            setBtnText2('Confirm Hash & Claim');
            _alert("Invalid hash or empty")
        }
    }

    return (
        <>
        
        </>
    );
}
