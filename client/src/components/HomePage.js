import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import web3 from '../utils/web3';
import cryptoDebitCard, { verifyContract } from '../utils/contractConfig';

function HomePage() {
    const [account, setAccount] = useState('');
    const [contractStatus, setContractStatus] = useState('Checking...');
    const navigate = useNavigate();

    useEffect(() => {
        const checkContract = async () => {
            try {
                const isConnected = await verifyContract();
                setContractStatus(isConnected ? 'Connected' : 'Not Connected');
                
                // Optional: Test a contract method
                if (isConnected) {
                    const ethPrice = await cryptoDebitCard.methods.ETH_USD_PRICE().call();
                    console.log('ETH Price from contract:', ethPrice);
                }
            } catch (error) {
                console.error('Contract verification failed:', error);
                setContractStatus('Error');
            }
        };

        checkContract();
    }, []);

    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            setAccount(accounts[0]);

            // Verify network
            const networkId = await web3.eth.net.getId();
            console.log('Connected to network:', networkId);

            // Optional: Add network verification
            if (networkId !== 5777) { // Ganache network ID
                alert('Please connect to Ganache network!');
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    const handleContinue = () => {
        if (account) {
            navigate('/dashboard'); // We'll create this route later
        } else {
            alert('Please connect your wallet first');
        }
    };

    return (
        <div className="home-container">
            <div className="header">
                <h1 className="logo">CryptoSwap.in</h1>
                <button 
                    className="connect-button"
                    onClick={connectWallet}
                >
                    {account ? 
                        `${account.slice(0,6)}...${account.slice(-4)}` : 
                        'Connect Account'}
                </button>
            </div>

            <div className="main-content">
                <h2 className="title">What are Crypto Debit Cards</h2>
                <textarea 
                    className="info-text"
                    placeholder="A crypto debit card is a prepaid card that lets you use your cryptocurrency to make purchases and withdraw cash.
How it works:
When you make a purchase, the card automatically converts your cryptocurrency into the local currency at the point of sale. You can use crypto debit cards anywhere that accepts debit cards. 
Benefits:
Crypto debit cards can help make cryptocurrency more useful as a medium of exchange. They can also integrate the digital economy into daily life by allowing transactions to flow between traditional and decentralized financial systems."
                    readOnly
                />
            </div>

            <div className="footer">
                <button 
                    className="continue-button"
                    onClick={handleContinue}
                >
                    Continue .
                </button>
            </div>

            {/* Optional: Add status display for debugging */}
            <div className="debug-info" style={{ 
                position: 'fixed', 
                bottom: '10px', 
                left: '10px', 
                color: 'white',
                fontSize: '12px'
            }}>
                Contract Status: {contractStatus}
            </div>
        </div>
    );
}

export default HomePage;
