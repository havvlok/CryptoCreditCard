import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import web3 from '../utils/web3';
import cryptoDebitCard from '../utils/contractConfig';

function Dashboard() {
    const [usdAmount, setUsdAmount] = useState('');
    const [ethAmount, setEthAmount] = useState('');
    const [account, setAccount] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkConnection = async () => {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        };
        checkConnection();
    }, []);

    const calculateEth = async () => {
        try {
            if (!usdAmount) return;
            const weiAmount = await cryptoDebitCard.methods.calculateRequiredWei(usdAmount).call();
            const ethValue = web3.utils.fromWei(weiAmount, 'ether');
            setEthAmount(ethValue);
        } catch (error) {
            console.error('Error calculating ETH:', error);
        }
    };

    const handleUsdChange = (e) => {
        setUsdAmount(e.target.value);
        setEthAmount(''); // Clear ETH amount when USD changes
    };

    const navigateToConvert = () => {
        navigate('/convert');
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 className="logo">CryptoSwap.in</h1>
                <div className="wallet-info">
                    {account ? 
                        `${account.slice(0,6)}...${account.slice(-4)}` : 
                        'Connect Wallet'}
                </div>
            </div>

            <div className="main-content">
                <h2 className="title">Check the Latest Rates</h2>
                
                <div className="converter-container">
                    <div className="input-box">
                        <input
                            type="number"
                            value={usdAmount}
                            onChange={handleUsdChange}
                            placeholder="Enter amount"
                        />
                        <span className="currency">USD</span>
                    </div>

                    <button className="convert-button" onClick={calculateEth}>
                        -&gt;
                    </button>

                    <div className="input-box">
                        <input
                            type="text"
                            value={ethAmount}
                            readOnly
                            placeholder="ETH equivalent"
                        />
                        <span className="currency">ETH</span>
                    </div>
                </div>

                <div className="convert-action">
                    <button 
                        className="convert-action-button"
                        onClick={navigateToConvert}
                    >
                        Convert
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
