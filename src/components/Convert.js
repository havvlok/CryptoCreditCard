import React, { useState, useEffect } from 'react';
import '../styles/Convert.css';
import web3 from '../utils/web3';
import cryptoDebitCard from '../utils/contractConfig';

function Convert() {
    const [account, setAccount] = useState('');
    const [userDetails, setUserDetails] = useState({
        address: '',
        cryptoBalance: '0',
        fiatBalance: '0'
    });
    const [usdAmount, setUsdAmount] = useState('');
    const [ethAmount, setEthAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            const accounts = await web3.eth.getAccounts();
            if (accounts[0]) {
                setAccount(accounts[0]);
                fetchUserDetails(accounts[0]);
            }
        };
        init();
    }, []);

    const fetchUserDetails = async (address) => {
        try {
            const details = await cryptoDebitCard.methods.getUserDetails().call({ from: address });
            setUserDetails({
                address: details.userAddress,
                cryptoBalance: web3.utils.fromWei(details.cryptoBalance, 'ether'),
                fiatBalance: details.fiatBalance.toString()
            });
            console.log('Fetched details:', details);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleDepositCrypto = async () => {
        try {
            setLoading(true);
            const requiredWei = await cryptoDebitCard.methods.calculateRequiredWei(usdAmount).call();
            
            await cryptoDebitCard.methods.depositCrypto(usdAmount).send({
                from: account,
                value: requiredWei
            });

            // Refresh user details after transaction
            await fetchUserDetails(account);
            setUsdAmount('');
            alert('Successfully converted ETH to USD!');
        } catch (error) {
            console.error('Error in deposit:', error);
            alert('Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawCrypto = async () => {
        try {
            setLoading(true);
            await cryptoDebitCard.methods.withdrawCrypto(ethAmount).send({
                from: account
            });

            // Refresh user details after transaction
            await fetchUserDetails(account);
            setEthAmount('');
            alert('Successfully converted USD to ETH!');
        } catch (error) {
            console.error('Error in withdrawal:', error);
            alert('Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="convert-container">
            <div className="header">
                <h1 className="logo">CryptoSwap.in</h1>
                <div className="wallet-info">
                    {account ? 
                        `${account.slice(0,6)}...${account.slice(-4)}` : 
                        'Connect Account'}
                </div>
            </div>

            <div className="main-content">
                <div className="user-details">
                    <div className="details-card">
                        <div className="detail-item">
                            <h3>Account Address:</h3>
                            <p>{userDetails.address}</p>
                        </div>
                        <div className="detail-item">
                            <h3>Crypto Balance:</h3>
                            <p>{Number(userDetails.cryptoBalance).toFixed(4)} ETH</p>
                        </div>
                        <div className="detail-item">
                            <h3>Fiat Balance:</h3>
                            <p>{userDetails.fiatBalance} USD</p>
                        </div>
                    </div>
                </div>

                <div className="conversion-section">
                    <div className="conversion-card">
                        <h3>Convert to USD</h3>
                        <div className="conversion-input">
                            <input
                                type="number"
                                value={usdAmount}
                                onChange={(e) => setUsdAmount(e.target.value)}
                                placeholder="Enter USD amount"
                            />
                            <button 
                                className="convert-button"
                                onClick={handleDepositCrypto}
                                disabled={loading}
                            >
                                convert
                            </button>
                        </div>
                    </div>

                    <div className="conversion-card">
                        <h3>Convert to ETH</h3>
                        <div className="conversion-input">
                            <input
                                type="number"
                                value={ethAmount}
                                onChange={(e) => setEthAmount(e.target.value)}
                                placeholder="Enter USD amount"
                            />
                            <button 
                                className="convert-button"
                                onClick={handleWithdrawCrypto}
                                disabled={loading}
                            >
                                convert
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Convert;
